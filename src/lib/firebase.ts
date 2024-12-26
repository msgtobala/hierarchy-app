import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDfuBZ2KqJF3IfRN0wsRgGNsq077kgmCcY",
  authDomain: "hierarchy-app-960f8.firebaseapp.com",
  projectId: "hierarchy-app-960f8",
  storageBucket: "hierarchy-app-960f8.firebasestorage.app",
  messagingSenderId: "762775731083",
  appId: "1:762775731083:web:e0a27c86617b643c8c8d8e",
  measurementId: "G-PGCNX6ECN0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);