import { Route } from 'react-router-dom';
import Landing from './components/Landing/Landing';
import Profile from './components/Profile/Profile';
import NavBar from './components/Nav/Nav';

export default function AuthContainer() {
	return (
		<>
			<NavBar />
			<Route exact path='/home' component={Landing} />
			<Route exact path='/profile' component={Profile} />
		</>
	)
}