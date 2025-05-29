import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDlg8UyiAekeV7TE5Vd1INVhHUqM9jWIdA",
  authDomain: "modernvid-1d68d.firebaseapp.com",
  projectId: "modernvid-1d68d",
  storageBucket: "modernvid-1d68d.firebasestorage.app",
  messagingSenderId: "206983957438",
  appId: "1:206983957438:web:bf87033714b98bcf9f07ef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const db = getFirestore(app);

// Добавляем обработчик изменения состояния аутентификации
auth.onAuthStateChanged((user) => {
  console.log("Auth state changed:", user ? "User logged in" : "User logged out");
});