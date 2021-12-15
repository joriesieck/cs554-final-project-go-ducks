import {
  auth,
  fbProvider,
  gitProvider,
  googleProvider,
} from '../../firebase/firebaseSetup';
import { signInWithEmailAndPassword, signInWithPopup } from '@firebase/auth';
import { useState } from 'react';
import { Alert, Button, TextField, FormControlLabel, Checkbox } from '@mui/material';
import { useDispatch, useSelector } from "react-redux";
import { checkString, checkBool } from '../../utils/inputChecks';
import { getUserByName, getUserByEmail, addUser } from "../../utils/backendCalls";
import { Link, Redirect } from 'react-router-dom';
import Image from 'next/image';

import googleLogo from '../../imgs/google-logo.png';
import fbLogo from '../../imgs/facebook-logo.png';
import gitLogo from '../../imgs/github-logo.png';
import styles from './LogIn.module.css';

export default function LogIn() {
	const [errors, setErrors] = useState(null);
	const [loggedIn, setLoggedIn] = useState(false);
	const [displaySignUp, setDisplaySignUp] = useState(false);
	const [email, setEmail] = useState(null);
	const user = useSelector((state) => state.user.user);
	const dispatch = useDispatch();

	// if user is already logged in, redirect to home
	if (user) return <Redirect to="/home" />;

	const logUserIn = async (e) => {
		e.preventDefault();

		let email = e.target[0].value;
		const password = e.target[2].value;

		const errorList = [];
		// error checking
		try {
			email = checkString(email, 'Email', true, false);
		} catch (e) {
			errorList.push(e.toString());
		}
		try {
			checkString(password, 'Password', false, false);
		} catch (e) {
			errorList.push(e.toString());
		}

		// if there were errors, set errors
		if (errorList.length>0) {
			setErrors(errorList);
			//clear fields
			document.getElementById('email').value = '';
			document.getElementById('password').value = '';
			return;
		}

		let result;
		let authToken;
		try {
			result = await signInWithEmailAndPassword(auth, email, password);
			console.log(result);
			authToken = result.user.accessToken;
			if (!result.user.uid) throw Error('couldnt log in');
		} catch (e) {
			setErrors(['Invalid login credentials.']);
			//clear fields
			document.getElementById('email').value = '';
			document.getElementById('password').value = '';
			return;
		}

		// make sure we have a record for this person in the db - otherwise just give them the chance to sign up
		try {
			result = await getUserByEmail(email);
			if (!result._id) {
				setEmail(email);
				setDisplaySignUp(true);
				return;
			}
		} catch (e) {
			if (!e.response || !e.response.data || !e.response.data.error) {
				setErrors(([e.toString()]));
				return
			}
			if (e.response.data.error.includes('not found') || e.status!==404) {
				setEmail(email);
				setDisplaySignUp(true);
				return;
			}
		}
		// TODO setAuthToken like setEmail
		// store auth token in redux
		dispatch({
			type: 'UPDATE_TOKEN',
			payload: authToken
		})
		// store email in redux
		dispatch({
			type: 'LOG_IN',
			payload: email
		});

		setLoggedIn(true);
	}

	const googleProviderSignIn = (e) => {
		e.preventDefault();
		providerSignIn(googleProvider);
	}
	const fbProviderSignIn = (e) => {
		// i may give up on facebook :(
		e.preventDefault();
		providerSignIn(fbProvider);
	}
	const gitProviderSignIn = (e) => {
		e.preventDefault();
		providerSignIn(gitProvider);
	}

	const providerSignIn = async (provider) => {
		let result;
		let authToken;
		try {
			// try pop up - some browsers block
			result = await signInWithPopup(auth, provider);
			console.log(result);
			authToken = result.user.authToken;
		} catch (e) {
			console.log(e);
			// print a message asking to allow popups
			setErrors(['Please try again to sign in with a provider. You may have to allow pop-ups.']);
			return;
		}
		if (result && result.user && result.user.email) setErrors(null);
		else return;
		console.log(result);
		
		// make sure we have a record for this person in the db - otherwise just give them the chance to sign up
		let dbResult;
		try {
			dbResult = await getUserByEmail(result.user.email);
			if (!dbResult._id) {
				setEmail(result.user.email);
				setDisplaySignUp(true);
				return;
			}
		} catch (e) {
			if (!e.response || !e.response.data || !e.response.data.error) {
				setErrors(([e.toString()]));
				return
			}
			if (e.response.data.error.includes('not found') || e.status!==404) {
				setEmail(result.user.email);
				setDisplaySignUp(true);
				return;
			}
		}

		// store email in redux
		dispatch({
			type: 'LOG_IN',
			payload: result.user.email
		});
	}

	const signUserUp = async (e) => {
		e.preventDefault();

		let username = e.target[0].value;
		const optedForLeaderboard = e.target[2].checked;
		// error checking
		const errorList = [];
		try {
			username = checkString(username, 'Username', true, false);
		} catch (e) {
			errorList.push(e.toString());
		}
		try {
			checkBool(optedForLeaderboard, 'OptedForLeaderboard');
		} catch (e) {
			errorList.push(e.toString());
		}
		if (errorList.length>0) {
			setErrors(errorList);
			return;
		}

		// make sure username not already in db
		try {
			const result = await getUserByName(username);
			if (result && result._id) {
				setErrors(['Sorry, that username is in use by someone else. Please pick a new one.']);
				return;
			}
		} catch (e) {
			// make sure error is doesn't exist
			if (!e.response || !e.response.data || !e.response.data.error) {
				setErrors(([e.toString()]));
				return
			}
			if (!e.response.data.error.includes('not found') && !e.status!==404) {
				setErrors([e.response.data.error]);
				return;
			}
		}
		
		// add user to database
		try {
			const result = await addUser(username, email, optedForLeaderboard);
			console.log(result);
		} catch (e) {
			if (!e.response || !e.response.data || !e.response.data.error) {
				setErrors(([e.toString()]));
				return;
			}
			setErrors([e.response.data.error]);
			return;
		}

		dispatch({
			type: 'LOG_IN',
			payload: email
		});

		setLoggedIn(true);
	}

	if (loggedIn) return <Redirect to="/home" />

	return (
		<div className={styles.loginUser}>
			<h1>Log In</h1>
			<form onSubmit={logUserIn} className={styles.loginUserForm}>
				<TextField id="email" required type="email" label="Email" />
				<TextField id="password" required type="password" label="Password" />
				<Button type="submit" variant="contained">Log in</Button>
			</form>
			
			<div className={styles.providerLogos}>
			<Button variant="contained" className={styles.providerLogo} onClick={googleProviderSignIn}>
				<Image src={googleLogo} alt="sign in with google" height={50} width={50} />
				Sign in with Google
			</Button>
			{/* <Button variant="contained" className='provider-logo' onClick={fbProviderSignIn}>
				<img src={fbLogo} alt="sign in with facebook" height={50} width={50} />
				Sign in with Facebook
			</Button> */}
			<Button variant="contained" className={styles.providerLogo} onClick={gitProviderSignIn}>
				<Image src={gitLogo} alt="sign in with github" height={50} width={50} />
				Sign in with GitHub
			</Button>
			</div>

			{displaySignUp && <>
				<p>Looks like you don't have an account yet. Please fill out this short form and we'll create one for you.</p>
				<form onSubmit={signUserUp}>
					<TextField id="username" required label="Username" />
					<FormControlLabel control={<Checkbox id="optedForLeaderboard" />} label="Include me in the leaderboard (you can change this later)" />
					<Button type="submit" variant="contained">Complete signup</Button>
				</form>
			</>}

			{errors && <Alert severity="error" className={styles.loginErrors}>
				<ul>
					{errors.map((error) => {
						error = error.replace('Error: ', '');
						return <li key={error}>{error}</li>
					})}
				</ul>
			</Alert>}

			<p>Test user: email: testing@test.com, password: test12</p>
			<p>Not a user yet? <Link to="/create-user">Create Account</Link></p>
		</div>
	)
}

// google logo: https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.freepngimg.com%2Fthumb%2Fgoogle%2F66903-google-pay-gboard-platform-logo-cloud.png&f=1&nofb=1
// fb logo: https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.freepngimg.com%2Fthumb%2Ffacebook%2F65310-icons-media-fb-computer-facebook-social.png&f=1&nofb=1
