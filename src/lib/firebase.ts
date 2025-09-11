import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

// Set persistence
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Could not set auth persistence", error);
  });

export { app, auth, db, googleProvider };
