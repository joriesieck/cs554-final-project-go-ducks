import { auth } from "../../firebase/firebaseSetup";
import { Redirect } from "react-router-dom";

export default function Home() {
	// console.log(auth);
	// // if user is not logged in, redirect to login
	// if (!auth.currentUser) return <Redirect to="/" />;
	return (
		<>
			<h1>Home</h1>
			<p>Welcome to Jeopardy! Feel free to explore the questions or add friends to compete against them!</p>
		</>
	)
}