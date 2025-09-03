
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig: FirebaseOptions = {
  "projectId": "nihongo-mastery-yf6qk",
  "appId": "1:204478234981:web:058eed5f05b0cd9e1d218c",
  "storageBucket": "nihongo-mastery-yf6qk.firebasestorage.app",
  "apiKey": "AIzaSyAYax2NoCc7AhC6UvUonR71mx-TVoUSWs4",
  "authDomain": "nihongo-mastery-yf6qk.firebaseapp.com",
  "messagingSenderId": "204478234981",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
