import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBz2Q5VUEjo1km59VmSlgjp5OfxXcx80O0",
  authDomain: "vendor-evaluation-ee39e.firebaseapp.com",
  projectId: "vendor-evaluation-ee39e",
  storageBucket: "vendor-evaluation-ee39e.firebasestorage.app",
  messagingSenderId: "864017817172",
  appId: "1:864017817172:web:54cc6d3bcbb80eccefd7c1",
  measurementId: "G-XNPYL40CL2"
};

export const app = initializeApp(firebaseConfig); 
export const db = getFirestore(app);
