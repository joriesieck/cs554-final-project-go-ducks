import { auth } from "../../firebase/firebaseSetup";
import { signInWithEmailAndPassword } from "@firebase/auth";
import axios from 'axios';

export default function LogIn() {
	const logUserIn = async (e) => {
		e.preventDefault();

		const email = e.target[0].value;
		const password = e.target[1].value;

		let result;
		try {
			result = await signInWithEmailAndPassword(auth, email, password);
			console.log('user should be logged in');
			console.log(result);
		} catch (e) {
			console.log(e);
		}

		// call the get user endpoint
		let data;
		try {
			({data} = await axios.get('http://localhost:3001/users/testuser'));
		} catch (e) {
			console.log('error');
			console.log(e);
		}
		console.log(data);
	}

	return (
		<>
			<h1>Log In</h1>
			<form onSubmit={logUserIn}>
				<label htmlFor="email">Email</label>
				<input id="email" />
				<label htmlFor="password">Password</label>
				<input id="password" />
				<button type="submit">Log in</button>
			</form>
			<p>Test user: email: testing@test.com, password: test12</p>
		</>
	)
}