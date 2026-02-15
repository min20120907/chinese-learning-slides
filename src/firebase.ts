import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAhI3bXJaIiWY645gNtZIh1uWfQqKVGfXo",
    authDomain: "login-verificati-1712467959577.firebaseapp.com",
    projectId: "login-verificati-1712467959577",
    storageBucket: "login-verificati-1712467959577.firebasestorage.app",
    messagingSenderId: "38223529044",
    appId: "1:38223529044:web:512cb773a5ac162cfed9c1",
    measurementId: "G-7XDNJSF2PT"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
