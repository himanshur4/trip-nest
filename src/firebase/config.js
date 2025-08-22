// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBv1eibuyjG_8osD09KEIPs5ibFnO0yDV4",
  authDomain: "trip-nest-1.firebaseapp.com",
  projectId: "trip-nest-1",
  storageBucket: "trip-nest-1.appspot.com",
  messagingSenderId: "681479403710",
  appId: "1:681479403710:web:05c04c977582d38ace06ef",
  measurementId: "G-5WX6QV2X81"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };