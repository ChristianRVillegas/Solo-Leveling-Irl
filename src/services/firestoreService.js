// In src/services/firestoreService.js
import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs
  } from 'firebase/firestore';
  import { db } from '../firebase/config';
  
  export const createUserProfile = async (uid, userData) => {
    try {
      await setDoc(doc(db, 'users', uid), {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };
  
  export const getUserProfile = async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  };
  
  export const updateUserProfile = async (uid, updatedData) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // Update existing profile
        await updateDoc(docRef, {
          ...updatedData,
          updatedAt: new Date()
        });
      } else {
        // Create profile if it doesn't exist
        await createUserProfile(uid, updatedData);
      }
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };
  
  // Game state management
  export const saveGameState = async (uid, gameState) => {
    try {
      await setDoc(doc(db, 'gameStates', uid), {
        ...gameState,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error saving game state:', error);
      throw error;
    }
  };
  
  export const getGameState = async (uid) => {
    try {
      const docRef = doc(db, 'gameStates', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting game state:', error);
      throw error;
    }
  };
  
  // Task management
  export const saveTasks = async (uid, tasks) => {
    try {
      await setDoc(doc(db, 'tasks', uid), {
        tasks,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  };
  
  export const getTasks = async (uid) => {
    try {
      const docRef = doc(db, 'tasks', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data().tasks;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  };
  
  // Achievement management
  export const saveAchievements = async (uid, achievements) => {
    try {
      await setDoc(doc(db, 'achievements', uid), {
        achievements,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error saving achievements:', error);
      throw error;
    }
  };
  
  export const getAchievements = async (uid) => {
    try {
      const docRef = doc(db, 'achievements', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data().achievements;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error getting achievements:', error);
      throw error;
    }
  };