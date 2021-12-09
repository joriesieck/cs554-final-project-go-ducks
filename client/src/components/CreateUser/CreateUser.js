import { auth, googleProvider, gitProvider } from "../../firebase/firebaseSetup";
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, signInWithPopup } from "@firebase/auth";
import { Alert, Button, TextField } from "@mui/material";
import { useState } from "react";
import { Redirect } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

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
		let password = e.target[4].value;

		// make sure all values exist
		const errorList = [];
		if (!username) errorList.push('Please enter a username.');
		if (!email) errorList.push('Please enter an email.');
		if (!password) errorList.push('Please enter a password.');
		// make sure all values are strings
		if (username && typeof username !== 'string') errorList.push('Username must be a string.');
		if (email && typeof email !== 'string') errorList.push('Email must be a string.');
		if (password && typeof password !== 'string') errorList.push('Password must be a string.');
		// trim and make sure all values are nonempty
		username = username.trim();
		email = email.trim();
		// don't trim password
		if (username==='') errorList.push('Username must contain at least one character.');
		if (email==='') errorList.push('Email must contain at least one character.');
		if (password==='') errorList.push('Password must contain at least one character.');
		if (username.match(/[ 	]/)) errorList.push('Username cannot contain any whitespace');
		if (email.match(/[ 	]/)) errorList.push('Email cannot contain any whitespace');
		// make sure password is at least 6 characters
		if (password.length<6) errorList.push('Password must be at least 6 characters.');

		// if there were errors, set errors
		if (errorList.length>0) {
			setErrors(errorList);
			return;
		}

		// make sure user doesn't exist
		try {
			const signInMethods = await fetchSignInMethodsForEmail(auth, email);
			if (signInMethods.length>0) throw Error('Email address already associated with an account.');
		} catch (e) {
			console.log(e);
			setErrors([e.toString()]);
			return;
		}

		// TODO - make sure username not already in db

		let result;
		try {
			result = await createUserWithEmailAndPassword(auth, email, password);
			if (!result.user.uid) throw Error('Something went wrong creating your account, please try again.');
		} catch (e) {
			console.log(e);
			setErrors([e.toString()]);
		}

		// TODO add user to db

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
		// todo - email already exists as regular user?

		let result;
		try {
			// try pop up - some browsers block
			result = await signInWithPopup(auth, provider);
		} catch (e) {
			// print a message asking to allow popups
			setErrors(['Please allow pop-ups and try again to sign in with a provider.']);
		}
		if (result && result.user && result.user.email) setErrors(null);
		// TODO what if user exits popup?

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
		const errorList = [];
		if (username && typeof username !== 'string') errorList.push('Username must be a string.');
		username = username.trim();
		if (username==='') errorList.push('Username must contain at least one character.');
		if (username.match(/[ 	]/)) errorList.push('Username cannot contain any whitespace');

		// if there were errors, set errors
		if (errorList.length>0) {
			setErrors(errorList);
			return;
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

			{errors && <Alert severity="error" id="create-user-errors">
				<ul>
					{errors.map((error) => <li key={error}>{error}</li>)}
				</ul>
			</Alert>}

			<p>Already have an account? <a href="/">Log in</a> instead.</p>
		</div>
	)
}