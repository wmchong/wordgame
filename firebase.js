// Import the functions you need from the SDKs you need

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import {getDatabase} from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAx-xUNrfVDBpM-Ca-XeChiQhYmTrCoNAs",
  authDomain: "wordgame-4bde7.firebaseapp.com",
  databaseURL: "https://wordgame-4bde7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wordgame-4bde7",
  storageBucket: "wordgame-4bde7.appspot.com",
  messagingSenderId: "266390285711",
  appId: "1:266390285711:web:308f2e732cd8539a676ffa"
};

// Initialize Firebase
let app;
if (firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app()
}

const auth = firebase.auth()

export { auth };

// Initialize Datatbase
export const db = getDatabase(app);
