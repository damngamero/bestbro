import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Node 25 ships Web Storage on by default, exposing a `localStorage` global on
// the server that throws ("getItem is not a function") when no storage file is
// configured. Firebase Auth probes that global during init and crashes SSR.
// Remove the broken stub on the server so Firebase treats storage as absent.
if (
  typeof window === "undefined" &&
  typeof (globalThis as any).localStorage !== "undefined" &&
  typeof (globalThis as any).localStorage?.getItem !== "function"
) {
  delete (globalThis as any).localStorage;
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYhYLrLJoknrqwDUkjlsImO0Y0EcUIROM",
  authDomain: "recipesavvy-fspvn.firebaseapp.com",
  projectId: "recipesavvy-fspvn",
  storageBucket: "recipesavvy-fspvn.appspot.com",
  messagingSenderId: "560392336050",
  appId: "1:560392336050:web:bc5ce667a2784b398d8fab"
};

// Initialize Firebase
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Set persistence (browser only — localStorage is unavailable during SSR).
if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
      console.error("Could not set auth persistence", error);
    });
}

export { app, auth, db, googleProvider };
