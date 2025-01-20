import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { getAuth, GoogleAuthProvider, updateEmail, updatePassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from "firebase/messaging";

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

  // Utility Functions for Auth
  const updateUserEmail = async (user, newEmail) => {
    await updateEmail(user, newEmail);
  };

  const updateUserPassword = async (user, newPassword) => {
    await updatePassword(user, newPassword);
  };

// const messaging = getMessaging(App);

// export const requestNotificationPermission = async () => {
//   try {
//     const token = await getToken(messaging, {
//       vapidKey: "BNOcT_Kinuc1jNDs4Dxowc2xAA1LjHLcqarkn6_1HdebAbS3NOJIhX2L4G86ZQmFuVEWDOoYzi2dnqVsQA-XR9I" // จาก Firebase Console
//     });
//     if (token) {
//       console.log("FCM Token:", token);
//       return token;
//     } else {
//       console.warn("No registration token available.");
//       return null;
//     }
//   } catch (error) {
//     console.error("Error getting FCM token:", error);
//     return null;
//   }
// };

// export const onMessageListener = () =>
//   new Promise((resolve) => {
//     onMessage(messaging, (payload) => {
//       resolve(payload);
//     });
//   });

  export {database,auth,googleProvider,updateUserEmail,updateUserPassword };