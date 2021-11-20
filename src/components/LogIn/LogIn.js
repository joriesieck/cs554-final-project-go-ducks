import { auth } from "../../firebase/firebaseSetup";
import { signInWithEmailAndPassword } from "@firebase/auth";
import { Redirect } from "react-router-dom";

export default function LogIn() {
	// if user is already logged in, redirect to landing
	if (auth.currentUser) return <Redirect to="/home" />;

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

			<p>Not a user yet? <a href="/create-user">Create Account</a></p>
		</>
	)
}