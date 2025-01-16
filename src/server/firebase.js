import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from "firebase/messaging";

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

  export {database,auth,googleProvider };