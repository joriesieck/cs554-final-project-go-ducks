import { Route } from 'react-router-dom';
import Home from './components/Home/Home';
import Profile from './components/Profile/Profile';
import NavBar from './components/Nav/Nav';
import GameSetup from './components/Game/GameSetup';
import Leaderboard from './components/Leaderboard/Leaderboard';
import Practice from './components/Practice/Practice';
import Friends from './components/Friends/Friends';

export default function AuthContainer() {
	return (
		<>
			<NavBar />
			<Route exact path='/home' component={Home} />
			<Route exact path='/profile' component={Profile} />
			<Route exact path='/game' component={GameSetup} />
			<Route exact path='/friends' component={Friends} />
			<Route exact path='/practice' component={Practice} />
			<Route exact path='/leaderboard' component={Leaderboard} />
		</>
	)
}
