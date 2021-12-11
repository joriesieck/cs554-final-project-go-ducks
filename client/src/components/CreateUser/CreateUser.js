import { auth, googleProvider, gitProvider } from "../../firebase/firebaseSetup";
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, signInWithPopup } from "@firebase/auth";
import { Alert, Button, Checkbox, FormControlLabel, TextField } from "@mui/material";
import { useState } from "react";
import { Redirect } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { checkString, checkBool } from "../../utils/inputChecks";
import { addUser, getUserByName } from "../../utils/backendCalls";

import './CreateUser.css';
import googleLogo from '../../imgs/google-logo.png';
import gitLogo from '../../imgs/github-logo.png';

export default function CreateUser() {
	const [errors, setErrors] = useState(null);
	const [created, setCreated] = useState(false);
	const [displayButton, setDisplayButton] = useState(true);
	const [email, setEmail] = useState(null);
	const user = useSelector((state) => state.user);
	const dispatch = useDispatch();

	// if user is already logged in, redirect to home
	if (user) return <Redirect to="/home" />;

	const createUser = async (e) => {
		e.preventDefault();
		setErrors(null);

		let username = e.target[0].value;
		let email = e.target[2].value;
		const password = e.target[4].value;
		const optedForLeaderboard = e.target[6].checked;

		// error checking
		const errorList = [];
		try {
			username = checkString(username, 'Username', true, false);
		} catch (e) {
			errorList.push(e.toString());
		}
		try {
			email = checkString(email, 'Email', true, false);
		} catch (e) {
			errorList.push(e.toString());
		}
		try {
			checkString(password, 'Password', false, true);
		} catch (e) {
			errorList.push(e.toString());
		}
		try {
			checkBool(optedForLeaderboard, 'optedForLeaderboard');
		} catch (e) {
			errorList.push(e.toString());
		}
		// make sure password is at least 6 characters
		if (password.length<6) errorList.push('Password must be at least 6 characters.');

		// if there were errors, set errors
		if (errorList.length>0) {
			setErrors(errorList);
			return;
		}

		// make sure user doesn't exist in firebase
		try {
			const signInMethods = await fetchSignInMethodsForEmail(auth, email);
			if (signInMethods.length>0) throw Error('Email address already associated with an account.');
		} catch (e) {
			console.log(e);
			setErrors([e.toString()]);
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
			e = e.toString();
			if (!e.includes('not found') && !e.includes('404')) {
				setErrors([e.toString()]);
				return;
			}
		}

		// add user to db
		try {
			const result = await addUser(username, email, optedForLeaderboard);
			console.log(result);
		} catch (e) {
			setErrors([e.toString()]);
			return;
		}

		let result;
		try {
			result = await createUserWithEmailAndPassword(auth, email, password);
			if (!result.user.uid) throw Error('Something went wrong creating your account, please try again.');
		} catch (e) {
			console.log(e);
			setErrors([e.toString()]);
			// DBTODO delete db record
			return;
		}

		// store email in redux
		dispatch({
			type: 'LOG_IN',
			payload: email
		});

		// redirect to home page
		setCreated(true);
	}

	const googleProviderSignIn = (e) => {
		e.preventDefault();
		providerSignIn(googleProvider);
	}
	const gitProviderSignIn = (e) => {
		e.preventDefault();
		providerSignIn(gitProvider);
	}

	const providerSignIn = async (provider) => {
		// TODO check if there are any other sign-in methods for this email
		let result;
		try {
			// try pop up - some browsers block
			result = await signInWithPopup(auth, provider);
		} catch (e) {
			// print a message asking to allow popups
			setErrors(['Please allow pop-ups and try again to sign in with a provider.']);
			return;
		}
		if (result && result.user && result.user.email) setErrors(null);
		else {
			// if user exits popup
			setErrors(['Looks like we couldn\'t sign you up. Please try again, or try creating an account using email and password.']);
			return;
		}

		// TODO - check if email already exists in db. if it does, delete that db record, i guess??

		// store email
		setEmail(result.user.email);

		// prompt for username
		setDisplayButton(false);
	}

	const storeProviderInfo = (e) => {
		e.preventDefault();
		
		let username = e.target[0].value;
		// error checking
		try {
			username = checkString(username, 'Username', true, false);
		} catch (e) {
			setErrors([e]);
		}

		// TODO - check if username already exists in db
		
		// TODO - add user to database

		dispatch({
			type: 'LOG_IN',
			payload: email
		});

		// redirect to homepage
		setCreated(true);
	}

	if (created) return <Redirect to="/home" />;

	return (
		<div id="create-user">
			<h1>Create User</h1>
			{displayButton && <form onSubmit={createUser} id="create-user-form">
				<TextField id="username" required label="Username" />
				<TextField id="email" required type="email" label="Email" />
				<TextField id="password" required type="password" label="Password" helperText="Must be at least 6 characters." />
				<FormControlLabel control={<Checkbox id="optedForLeaderboard" />} label="Include me in the leaderboard (you can change this later)" />
				<Button type="submit" variant="contained">Create User</Button>
			</form>}

			{displayButton&& <div className="provider-logos">
			<Button variant="contained" className='provider-logo' onClick={googleProviderSignIn}>
				<img src={googleLogo} alt="sign in with google" height={50} width={50} />
				Sign up with Google
			</Button>
			{/* <Button variant="contained" className='provider-logo' onClick={fbProviderSignIn}>
				<img src={fbLogo} alt="sign in with facebook" height={50} width={50} />
				Sign in with Facebook
			</Button> */}
			<Button variant="contained" className='provider-logo' onClick={gitProviderSignIn}>
				<img src={gitLogo} alt="sign in with github" height={50} width={50} />
				Sign up with GitHub
			</Button>
			</div>}
			{!displayButton && <>
				<p>Thanks for signing up! We still need a username to complete your registration.</p>
				<form onSubmit={storeProviderInfo}>
					<TextField id="provider-username" required label="Username" />
					<Button type="submit" variant="contained">Complete signup</Button>
				</form>
			</>}

			{errors && <Alert severity="error" className="create-user-errors">
				<ul>
					{errors.map((error) => {
						error = error.replace('Error: ', '');
						return <li key={error}>{error}</li>;
					})}
				</ul>
			</Alert>}

			<p>Already have an account? <a href="/">Log in</a> instead.</p>
		</div>
	)
}