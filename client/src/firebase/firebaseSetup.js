import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';


// add our API keys
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,

};

// initialize the app
const firebaseApp = initializeApp(firebaseConfig);

// set up auth
const auth = getAuth(firebaseApp);

export default firebaseApp;

export { auth };
