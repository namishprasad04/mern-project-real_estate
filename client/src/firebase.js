// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-30eab.firebaseapp.com",
  projectId: "mern-estate-30eab",
  storageBucket: "mern-estate-30eab.appspot.com",
  messagingSenderId: "381762407741",
  appId: "1:381762407741:web:f043affaff158802a38954"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);