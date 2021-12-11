import { useState } from 'react';
import { auth } from "../../firebase/firebaseSetup";
import { signInWithEmailAndPassword } from "@firebase/auth";
import { Redirect } from "react-router-dom";
import { Alert, Button, TextField } from '@mui/material';
import { useDispatch, useSelector } from "react-redux";

import './LogIn.css';

export default function LogIn() {
	const [errors, setErrors] = useState(null);
	const [loggedIn, setLoggedIn] = useState(false);
	const user = useSelector((state) => state.user);
	const dispatch = useDispatch();

	// if user is already logged in, redirect to home
	if (user) return <Redirect to="/home" />;


	const logUserIn = async (e) => {
		e.preventDefault();

		const email = e.target[0].value;
		const password = e.target[2].value;
		console.log(e.target, email, password)


		let result;
		try {
			result = await signInWithEmailAndPassword(auth, email, password);

			console.log(result);
			if (result.user.uid) setLoggedIn(true);
			else throw Error('couldnt log in');
			dispatch({
				type: 'LOG_IN',
				payload: email
			});

		} catch (e) {
			console.log(e);
			setErrors([e.toString()])
			//clear fields
			document.getElementById('email').value = '';
			document.getElementById('password').value = '';
		}
	}

	if (loggedIn) return <Redirect to="/home" />

	return (
		<div id="login-user">
			<h1>Log In</h1>
			<form onSubmit={logUserIn} id="login-user-form">
				<TextField id="email" required type="email" label="Email" />
				<TextField id="password" required type="password" label="Password" />
				<Button type="submit" variant="contained">Log in</Button>
			</form>
			<p>Test user: email: testing@test.com, password: test12</p>
			{
				errors && <Alert severity="error">
					Could not log in with credentials provided. Try again!
				</Alert>
			}
			<p>Not a user yet? <a href="/create-user">Create Account</a></p>
		</div>

	)
}