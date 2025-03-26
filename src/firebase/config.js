import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAl88iCq6NceWXaCtuyjAZ9YlcXZlhhtxA",
  authDomain: "solo-leveling-1ad7c.firebaseapp.com",
  projectId: "solo-leveling-1ad7c",
  storageBucket: "solo-leveling-1ad7c.firebasestorage.app",
  messagingSenderId: "1000707203770",
  appId: "1:1000707203770:web:a490cff7f922dcbc2a5883",
  measurementId: "G-44QQP0F9GZ"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;