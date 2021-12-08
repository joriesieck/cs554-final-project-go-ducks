import { auth } from "../../firebase/firebaseSetup";
import { signInWithEmailAndPassword } from "@firebase/auth";
import { Redirect } from "react-router-dom";
import {Button, TextField} from '@mui/material';
import './LogIn.css';

export default function LogIn() {
	// if user is already logged in, redirect to home
	if (auth.currentUser) return <Redirect to="/home" />;

	const logUserIn = async (e) => {
		e.preventDefault();

		const email = e.target[0].value;
		const password = e.target[2].value;
		console.log(e.target, email, password)

		let result;
		try {
			result = await signInWithEmailAndPassword(auth, email, password);
			console.log('user should be logged in');
			console.log(result);
		} catch (e) {
			console.log(e);
		}
	}

	return (
		<div id="login-user">
			<h1>Log In</h1>
			<form onSubmit={logUserIn} id="login-user-form">
				<TextField id="email" required type="email" label="Email" />
				<TextField id="password" required type="password" label="Password" />
				<Button type="submit" variant="contained">Log in</Button>
			</form>
			<p>Test user: email: testing@test.com, password: test12</p>

			<p>Not a user yet? <a href="/create-user">Create Account</a></p>
		</div>
	)
}