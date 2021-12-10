import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";

export default function Home() {
	const user = useSelector((state) => state.user);
	// if user is not logged in, redirect to login
	if (!user) return <Redirect to="/" />;
	return (
		<>
			<h1>Home</h1>
			<p>Welcome to Jeopardy! Feel free to explore the questions or add friends to compete against them!</p>
		</>
	)
}