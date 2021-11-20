import { auth } from "../../firebase/firebaseSetup";
import { createUserWithEmailAndPassword } from "@firebase/auth";

export default function CreateUser() {
	const createUser = async (e) => {
		e.preventDefault();

		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;

		// TODO make sure is real email, since otherwise FB will create the account but not allow login

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
				<input id="email" />
				<label htmlFor="password">Password</label>
				<input id="password" />
				<button type="submit">Create User</button>
			</form>
		</>
	)
}