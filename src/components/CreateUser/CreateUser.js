import { auth } from "../../firebase/firebaseSetup";
import { createUserWithEmailAndPassword } from "@firebase/auth";
import { Button, TextField } from "@mui/material";

export default function CreateUser() {
	const createUser = async (e) => {
		e.preventDefault();

		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;

		let result;
		try {
			result = await createUserWithEmailAndPassword(auth, email, password);
			console.log('user should be created');
			console.log(result);
		} catch (e) {
			console.log(e);
		}
	}

	return (
		<>
			<h1>Create User</h1>
			<form onSubmit={createUser}>
				<label htmlFor="email">Email</label>
				<TextField id="email" required type="email" />
				<label htmlFor="password">Password</label>
				<TextField id="password" required type="password" />
				<Button type="submit">Create User</Button>
			</form>
		</>
	)
}