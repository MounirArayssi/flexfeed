import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAtjz_zZsj_ggw43xo228FEH4wK-cTrG9g",
  authDomain: "flexfeed-3db24.firebaseapp.com",
  projectId: "flexfeed-3db24",
  storageBucket: "flexfeed-3db24.appspot.com",
  messagingSenderId: "737726313578",
  appId: "1:737726313578:web:09e3abcfeda132f3200613",
  measurementId: "G-T694G105Y7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
