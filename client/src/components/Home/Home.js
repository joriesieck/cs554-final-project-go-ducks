import {Button} from '@mui/material';
import { Link, Redirect } from 'react-router-dom';
import { useSelector } from "react-redux";

export default function Home() {
	//TODO conditional leaderboard button if player has opted in?


	const user = useSelector((state) => state.user.user);
	// if user is not logged in, redirect to login
	if (!user) return <Redirect to="/" />;
	return (
		<>
			<h1>Home</h1>
			<p>Welcome to Jeopardy! Feel free to explore the questions or add friends to compete against them!</p>
			<div id="landingButtonGroup">
				<Button component={Link} to="/game" variant="contained" className="landingButton">Start a Game</Button>
				<Button component={Link} variant="contained" className="landingButton">Practice Questions By Category</Button>
				<Button component={Link} to="/profile" variant="contained" className="landingButton">View Profile</Button>
				<Button component={Link} variant="contained" className="landingButton">Manage Friends</Button>
				<Button component={Link} variant="contained" className="landingButton">Leaderboard</Button>
			</div>
			
		</>
	)
}