import { initializeApp } from "firebase/app";
import * as firebaseAuth from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyADXFo-jZS3APLwPsQoj8EexqzFE6zOtYQ",
  authDomain: "mzansi-drift.firebaseapp.com",
  projectId: "mzansi-drift",
  storageBucket: "mzansi-drift.firebasestorage.app",
  messagingSenderId: "30036819616",
  appId: "1:30036819616:web:3f1979d16d988683c213c5",
};

const app = initializeApp(firebaseConfig);

export const auth = firebaseAuth.initializeAuth(app, {
  persistence: (firebaseAuth as any).getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
export const storage = getStorage(app);
