import { auth, provider } from "../../firebase/firebaseSetup";
import { signInWithEmailAndPassword, signInWithPopup } from "@firebase/auth";
import { Redirect } from "react-router-dom";
import {Alert, Button, TextField} from '@mui/material';
import { useDispatch, useSelector } from "react-redux";

import googleLogo from '../../imgs/google-logo.png';
import './LogIn.css';
import { useState } from "react";

export default function LogIn() {
	const [error, setError] = useState(null);
	const user = useSelector((state) => state.user);
	const dispatch = useDispatch();

	// if user is already logged in, redirect to home
	if (user) return <Redirect to="/home" />;

	const logUserIn = async (e) => {
		e.preventDefault();

		const email = e.target[0].value;
		const password = e.target[2].value;

		// todo - error checking
		console.log(e.target, email, password)

		let result;
		try {
			result = await signInWithEmailAndPassword(auth, email, password);
			console.log('user should be logged in');
			console.log(result);
		} catch (e) {
			setError(e);
			return;
		}

		// store email in redux
		dispatch({
			type: 'LOG_IN',
			payload: email
		});
	}

	const providerSignIn = async (e) => {
		e.preventDefault();

		// todo - email already exists as regular user?

		let result;
		try {
			// try pop up - some browsers block
			result = await signInWithPopup(auth, provider);
		} catch (e) {
			// print a message asking to allow popups
			setError('Please allow pop-ups and try again to sign in with a provider.');
		}
		if (result && result.user && result.user.email) setError(null);

		// TODO - make sure we have a record for this person in the db. otherwise we need to get a username from them & store info -> so maybe redirect to create-user page & make them "sign in" w google again?

		// store email in redux
		dispatch({
			type: 'LOG_IN',
			payload: result.user.email
		});
	}

	return (
		<div id="login-user">
			<h1>Log In</h1>
			<form onSubmit={logUserIn} id="login-user-form">
				<TextField id="email" required type="email" label="Email" />
				<TextField id="password" required type="password" label="Password" />
				<Button type="submit" variant="contained">Log in</Button>
			</form>
			
			<Button variant="contained" className='provider-logo' onClick={providerSignIn}>
				<img src={googleLogo} alt="sign in with google" height={50} width={50} />
				Sign in with Google
			</Button>

			{error && <Alert severity="error" className='login-error'>
				{error}	
			</Alert>}

			<p>Test user: email: testing@test.com, password: test12</p>

			<p>Not a user yet? <a href="/create-user">Create Account</a></p>
		</div>
	)
}

// sign in with google image: https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fi.stack.imgur.com%2Ftp2XJ.png&f=1&nofb=1
// google logo: https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.freepngimg.com%2Fthumb%2Fgoogle%2F66903-google-pay-gboard-platform-logo-cloud.png&f=1&nofb=1 