import { auth } from "../../firebase/firebaseSetup";
import { signInWithEmailAndPassword } from "@firebase/auth";

export default function LogIn() {
	const logUserIn = async (e) => {
		e.preventDefault();

		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;

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