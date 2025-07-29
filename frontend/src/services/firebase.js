// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD98eQbdA_WX6J8trp5FTFYYiEmlWzb7aE",
  authDomain: "varn-bdcfc.firebaseapp.com",
  projectId: "varn-bdcfc",
  storageBucket: "varn-bdcfc.firebasestorage.app",
  messagingSenderId: "289407436751",
  appId: "1:289407436751:web:6ad7dcaff0c839fcdd34ba",
  measurementId: "G-V7B8TGR5TV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);