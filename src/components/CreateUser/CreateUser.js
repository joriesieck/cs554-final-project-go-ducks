import { auth } from "../../firebase/firebaseSetup";
import { createUserWithEmailAndPassword } from "@firebase/auth";
import { Alert, Button, TextField } from "@mui/material";
import { useState } from "react";

// TODO styling

export default function CreateUser() {
	const [errors, setErrors] = useState(null);

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

		// TODO make sure user doesn't exist


		let result;
		try {
			result = await createUserWithEmailAndPassword(auth, email, password);
			console.log('user should be created');
			console.log(result);
		} catch (e) {
			console.log(e);
			setErrors([e.toString()]);
		}
	}

	return (
		<>
			<h1>Create User</h1>
			<form onSubmit={createUser}>
				<TextField id="username" required label="Username" />
				<TextField id="email" required type="email" label="Email" />
				<TextField id="password" required type="password" label="Password" helperText="Must be at least 6 characters." />
				<Button type="submit">Create User</Button>
			</form>

			{errors && <Alert severity="error">
				<ul>
					{errors.map((error) => <li key={error}>{error}</li>)}
				</ul>
			</Alert>}
		</>
	)
}