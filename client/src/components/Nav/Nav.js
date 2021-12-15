import { Tabs, Tab, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, Redirect, useLocation } from 'react-router-dom';
import { signOut } from '@firebase/auth';
import { auth } from '../../firebase/firebaseSetup';
import { useDispatch } from 'react-redux';

import styles from './Nav.module.css';

export default function NavBar() {
  // get the pathname from react-router-dom since that's what we're linking through
  const { pathname } = useLocation();

  // set the default to be whatever is in the window
  const [value, setValue] = useState(
    window.location.href
      .match(/\/[a-zA-Z]+\/?$/)[0]
      .substr(1)
      .toLowerCase()
  );

  useEffect(() => {
    setValue(pathname.split('/')[1]);
  }, [pathname]);

  const [logout, setLogout] = useState(false);
  const dispatch = useDispatch();

  const logUserOut = () => {
    try {
      signOut(auth);
      dispatch({
        type: 'LOG_OUT',
      });
      setLogout(true);
    } catch (e) {
      console.log(e); //this never needs to be displayed i don't think
    }
  };

  if (logout) return <Redirect to="/" />;

  return (
    <div className={styles.nav}>
      <div className="reg-nav">
        <Tabs
          aria-label='navigation tabs'
          id='navigation-tabs'
          value={value}
          onChange={(e) => {
            setValue(e.target.innerText.toLowerCase());
          }}
          inputProps={{'aria-label': 'navigation tabs'}}
        >
          <Tab
            value="home"
            label="Home"
            aria-label="Home"
            component={Link}
            to="/home"
            id='home-tab'
            aria-controls='navigation-tabs'
            aria-labelledby='home-tab'
            inputProps={{'aria-label': 'home', 'aria-controls': 'navigation-tabs'}}
          />
          <Tab
            value="game"
            label="Game"
            aria-label="Game"
            component={Link}
            to="/game"
            id='game-tab'
            aria-controls='navigation-tabs'
            aria-labelledby='game-tab'
            inputProps={{'aria-label': 'game', 'aria-controls': 'navigation-tabs'}}
          />
          {/* <Tab
            value="practice"
            label="Practice"
            aria-label="Practice"
            component={Link}
            to="/practice"
            id='practice-tab'
            aria-controls='navigation-tabs'
            aria-labelledby='practice-tab'
            inputProps={{'aria-label': 'practice', 'aria-controls': 'navigation-tabs'}}
          /> */}
          <Tab
            value="leaderboard"
            label="Leaderboard"
            aria-label="Leaderboard"
            component={Link}
            to="/leaderboard"
            id='leaderboard-tab'
            aria-controls='navigation-tabs'
            aria-labelledby='leaderboard-tab'
            inputProps={{'aria-label': 'leaderboard', 'aria-controls': 'navigation-tabs'}}
          />
          <Tab
            value="profile"
            label="Profile"
            aria-label="Profile"
            component={Link}
            to="/profile"
            id='profile-tab'
            aria-controls='navigation-tabs'
            aria-labelledby='profile-tab'
            inputProps={{'aria-label': 'profile', 'aria-controls': 'navigation-tabs'}}
          />
        </Tabs>
      </div>
      <div className="logout-nav">
        <Button variant="contained" onClick={logUserOut}>
          Log Out
        </Button>
      </div>
    </div>
  );
}
