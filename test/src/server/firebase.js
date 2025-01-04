import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyADfKpfQckZyxWjM7i8kxvtMjDkgh0G3O8",
  authDomain: "scd-panda-1bc5a.firebaseapp.com",
  databaseURL: "https://scd-panda-1bc5a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "scd-panda-1bc5a",
  storageBucket: "scd-panda-1bc5a.firebasestorage.app",
  messagingSenderId: "222666567078",
  appId: "1:222666567078:web:8e8512c9ff63853b897367",
  measurementId: "G-SGK6FNMEYT"
};

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const database = firebase.database();
  const App = initializeApp(firebaseConfig);
  const auth = getAuth(App);
  const googleProvider = new GoogleAuthProvider();

  export {database,auth,googleProvider };