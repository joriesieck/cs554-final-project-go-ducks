import { auth } from "../../firebase/firebaseSetup";

import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "@firebase/auth";
import { Alert, Button, TextField } from "@mui/material";
import { useState } from "react";
import { Redirect } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import './CreateUser.css';

export default function CreateUser() {
	const [errors, setErrors] = useState(null);
	const [created, setCreated] = useState(false);
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

		let result;
		try {
			result = await createUserWithEmailAndPassword(auth, email, password);
			if (!result.user.uid) throw Error('Something went wrong creating your account, please try again.');
		} catch (e) {
			console.log(e);
			setErrors([e.toString()]);
		}

		// TODO add user to db

		// log in
		dispatch({
			type: 'LOG_IN',
			payload: username
		});

		// redirect to home page
		setCreated(true);
	}

	if (created) return <Redirect to="/home" />;

	return (
		<div id="create-user">
			<h1>Create User</h1>
			<form onSubmit={createUser} id="create-user-form">
				<TextField id="username" required label="Username" />
				<TextField id="email" required type="email" label="Email" />
				<TextField id="password" required type="password" label="Password" helperText="Must be at least 6 characters." />
				<Button type="submit" variant="contained">Create User</Button>
			</form>

			{errors && <Alert severity="error" id="create-user-errors">
				<ul>
					{errors.map((error) => <li key={error}>{error}</li>)}
				</ul>
			</Alert>}

			<p>Already have an account? <a href="/">Log in</a> instead.</p>
		</div>
	)
}