import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyD_1POgwclTGt7GgM5f51u4a3hcnlQXAjM",
  authDomain: "pandastaroil-70b11.firebaseapp.com",
  databaseURL: "https://pandastaroil-70b11-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pandastaroil-70b11",
  storageBucket: "pandastaroil-70b11.firebasestorage.app",
  messagingSenderId: "977519524333",
  appId: "1:977519524333:web:35ae84a37c15d3551b0fe4",
  measurementId: "G-VMJMXJHP04"
};

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const database = firebase.database();
  const App = initializeApp(firebaseConfig);
  const auth = getAuth(App);
  const googleProvider = new GoogleAuthProvider();

  export {database,auth,googleProvider };