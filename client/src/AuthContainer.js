import { Route } from 'react-router-dom';
import Home from './components/Home/Home';
import Profile from './components/Profile/Profile';
import NavBar from './components/Nav/Nav';
import GameSetup from './components/Game/GameSetup';

export default function AuthContainer() {
  return (
    <>
      <NavBar />
      <Route exact path="/home" component={Home} />
      <Route exact path="/profile" component={Profile} />
      <Route exact path="/game" component={GameSetup} />
    </>
  );
}
