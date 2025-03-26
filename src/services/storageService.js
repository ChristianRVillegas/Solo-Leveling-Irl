import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { auth, storage } from '../firebase/config';
import { createUserProfile, getUserProfile, updateUserProfile } from './firestoreService';

/**
 * Upload profile picture to Firebase Storage
 * @param {string} imageData - Base64 image data
 * @returns {Promise<string>} Download URL of the uploaded image
 */
export const uploadProfilePicture = async (imageData) => {
  try {
    // Debug info
    console.log("Starting profile picture upload...");
    
    if (!auth.currentUser) {
      throw new Error("No authenticated user found");
    }
    
    const userId = auth.currentUser.uid;
    console.log("User ID:", userId);
    
    // Upload directly to the userId path according to rules
    const imagePath = `profilePictures/${userId}`;
    const imageRef = ref(storage, imagePath);
    
    console.log("Uploading to path:", imagePath);
    
    // Upload the image data
    const snapshot = await uploadString(imageRef, imageData, 'data_url');
    console.log("Upload complete, getting download URL...");
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("Download URL obtained:", downloadURL);
    
    // Update Firebase Auth user profile
    try {
      await updateProfile(auth.currentUser, {
        photoURL: downloadURL
      });
      console.log("Firebase Auth profile updated with new photo URL");
    } catch (authError) {
      console.error("Error updating Firebase Auth profile:", authError);
      // Continue even if auth profile update fails
    }
    
    // Also save to Firestore user profile
    try {
      await updateUserProfile(userId, {
        profilePicture: downloadURL
      });
      console.log("Firestore user profile updated with new photo URL");
    } catch (firestoreError) {
      console.error("Error updating Firestore profile:", firestoreError);
      // Continue even if Firestore update fails
    }
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
};

// Test function to verify storage is working
export const testStorageConnection = async () => {
  try {
    console.log("Testing Firebase Storage connection...");
    console.log("Storage object:", storage);
    
    if (!auth.currentUser) {
      throw new Error("No authenticated user found");
    }
    
    // Try with a simple string upload to test connection
    const testRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);
    const testString = "Test data " + new Date().toISOString();
    
    await uploadString(testRef, testString);
    const downloadURL = await getDownloadURL(testRef);
    
    return "Storage connection successful! URL: " + downloadURL;
  } catch (error) {
    console.error("Error testing storage connection:", error);
    throw error;
  }
};
