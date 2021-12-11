import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, GithubAuthProvider } from 'firebase/auth';
import env from 'react-dotenv';

// add our API keys
const firebaseConfig = {
	apiKey: env.FIREBASE_API_KEY,
	authDomain: env.FIREBASE_AUTH_DOMAIN,
	projectId: env.FIREBASE_PROJECT_ID,
	storageBucket: env.FIREBASE_STORAGE_BUCKET,
	messagingSenderId: env.FIREBASE_SENDER_ID,
	appId: env.FIREBASE_APP_ID
};

// initialize the app
const firebaseApp = initializeApp(firebaseConfig);

// set up auth
const auth = getAuth(firebaseApp);

// set up google
const googleProvider = new GoogleAuthProvider();

// set up facebook
const fbProvider = new FacebookAuthProvider();

// set up github
const gitProvider = new GithubAuthProvider();

export default firebaseApp;
export { auth, googleProvider, fbProvider, gitProvider };