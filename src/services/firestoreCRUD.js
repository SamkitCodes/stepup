// firestoreCRUD.js - Handles Firestore CRUD operations for user data and activities

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";

// Creates a new user document in the 'UserData' collection
export const createUserData = async (userData) => {
  try {
    const userRef = doc(db, "UserData", userData.userId);
    await setDoc(userRef, {
      name: userData.name,
      email: userData.email,
      dob: userData.dob,
      goal: userData.goal,
      streak: 0,
      history: {},
    });
    return true;
  } catch (error) {
    throw error;
  }
};

// Retrieves a user document from 'UserData' by userId
export const getUserData = async (userId) => {
  try {
    const userRef = doc(db, "UserData", userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};

// Updates specific fields of a user document
export const updateUserData = async (userId, updatedData) => {
  try {
    const userRef = doc(db, "UserData", userId);
    await updateDoc(userRef, updatedData);
    return true;
  } catch (error) {
    throw error;
  }
};

// Deletes a user document from 'UserData'
export const deleteUserData = async (userId) => {
  try {
    const userRef = doc(db, "UserData", userId);
    await deleteDoc(userRef);
    return true;
  } catch (error) {
    throw error;
  }
};

// Adds a run summary to a user's history
export const addRunToHistory = async (userId, runData) => {
  try {
    const historyRef = collection(db, "UserData", userId, "history");
    await addDoc(historyRef, {
      startedAt: runData.startedAt, // Date object or ISO string
      duration: runData.duration, // in seconds
      distance: runData.distance, // in meters
      averagePace: runData.averagePace, // decimal min/km
      fastestPace: runData.fastestPace, // decimal min/km
      photos: runData.photos || [], // array of URIs
      routeScreenshot: runData.routeScreenshot || null, // single URI
      notes: runData.notes || "",
    });
    return true;
  } catch (error) {
    throw error;
  }
};

// Retrieves run history for a given user
export const getUserHistory = async (userId) => {
  try {
    const historyRef = collection(db, "UserData", userId, "history");
    const snapshot = await getDocs(historyRef);
    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    throw error;
  }
};
