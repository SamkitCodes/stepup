// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import "firebase/firestore";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAlNMaVr5YOENdMZhR0Ha0SWdF-SXFrmd0",
  authDomain: "stepup-81a19.firebaseapp.com",
  projectId: "stepup-81a19",
  storageBucket: "stepup-81a19.firebasestorage.app",
  messagingSenderId: "434994163655",
  appId: "1:434994163655:web:4a7e5b35a7b8104cfb33e2",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const firebase_auth = getAuth(app);
export const db = getFirestore(app);
