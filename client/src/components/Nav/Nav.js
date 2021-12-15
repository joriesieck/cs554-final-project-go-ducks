import { Tabs, Tab, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { signOut } from '@firebase/auth';
import { auth } from '../../firebase/firebaseSetup';
import { useDispatch } from 'react-redux';

import styles from './Nav.module.css';

export default function NavBar() {
  const [value, setValue] = useState(
    window.location.href
      .match(/\/[a-zA-Z]+\/?$/)[0]
      .substr(1)
      .toLowerCase()
  );

  // TODO fix buttons

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
          />
          <Tab
            value="leaderboard"
            label="Leaderboard"
            aria-label="Leaderboard"
            component={Link}
            to="/leaderboard"
            id='leaderboard-tab'
            aria-controls='navigation-tabs'
            aria-labelledby='leaderboard-tab'
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
