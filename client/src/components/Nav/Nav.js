import { Tabs, Tab, Button, Menu, MenuItem } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, Redirect, useLocation } from 'react-router-dom';
import { signOut } from '@firebase/auth';
import { auth } from '../../firebase/firebaseSetup';
import { useDispatch } from 'react-redux';
import MenuIcon from '@mui/icons-material/Menu';
import styles from './Nav.module.css';

export default function NavBar() {
  // get the pathname from react-router-dom since that's what we're linking through
  const { pathname } = useLocation();

  // set the default to be whatever is in the window
  const [value, setValue] = useState('');
  // const [value, setValue] = useState(
  //   window.location.href
  //     .match(/\/[a-zA-Z]+\/?$/)[0]
  //     .substr(1)
  //     .toLowerCase()
  // );

  const [openMenu, setOpenMenu] = useState(false);
  const [anchor, setAnchor] = useState(null);

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

  return (<>
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
            value="game"
            label="Game"
            aria-label="Game"
            component={Link}
            to="/game"
            id='game-tab'
            aria-controls='navigation-tabs'
            aria-labelledby='game-tab'
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
            value="friends"
            label="Friends"
            aria-label="Friends"
            component={Link}
            to="/friends"
            id='friends-tab'
            aria-controls='navigation-tabs'
            aria-labelledby='profile-tab'
          />
        </Tabs>
      </div>
      <div className="logout-nav">
        <Button variant="contained" onClick={logUserOut}>
          Log Out
        </Button>
      </div>
    </div>
    <div className={styles.responsiveNav}>
          <MenuIcon
            onClick={(e) => {
              console.log(e);
              setOpenMenu(true);
              setAnchor(e.target);
            }}
            aria-controls='responsive-menu'
            aria-haspopup='true'
            aria-expanded={openMenu}
            id='trigger-responsive-menu'
            aria-label='open menu'
            className={styles.responsiveNavIcon}
          />
          <Menu
            id='responsive-menu'
            open={openMenu}
            onClose={() => {setOpenMenu(false)}}
            MenuListProps={{
              'aria-labelledby': 'trigger-responsive-menu'
            }}
            anchorEl={anchor}
            className={styles.responsiveNav}
          >
            <MenuItem component={Link} to='/home' onClick={() => {setOpenMenu(false)}}>Home</MenuItem>
            <MenuItem component={Link} to='/game' onClick={() => {setOpenMenu(false)}}>Game</MenuItem>
            <MenuItem component={Link} to='/leaderboard' onClick={() => {setOpenMenu(false)}}>Leaderboard</MenuItem>
            <MenuItem component={Link} to='/profile' onClick={() => {setOpenMenu(false)}}>Profile</MenuItem>
            <MenuItem onClick={logUserOut}>Log Out</MenuItem>
            {/* <MenuItem onClick={handleMenuClick}>Practice</MenuItem> */}
          </Menu>
    </div>
  </>);
}
