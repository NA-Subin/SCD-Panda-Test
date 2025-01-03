import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyAi3nHbYLuENtoCXkPCvFLMLGsRWKEttYs",
  authDomain: "test-scd-panda.firebaseapp.com",
  databaseURL: "https://test-scd-panda-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "test-scd-panda",
  storageBucket: "test-scd-panda.firebasestorage.app",
  messagingSenderId: "1033288965830",
  appId: "1:1033288965830:web:62389d510aa27cb74e81c7",
  measurementId: "G-E1M7MREFRJ"
};

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const database = firebase.database();
  const App = initializeApp(firebaseConfig);
  const auth = getAuth(App);
  const googleProvider = new GoogleAuthProvider();

  export {database,auth,googleProvider };