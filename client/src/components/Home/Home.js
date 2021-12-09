import {Button} from '@mui/material';
import { Link } from 'react-router-dom';

export default function Home() {
	//TODO conditional leaderboard button if player has opted in?
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