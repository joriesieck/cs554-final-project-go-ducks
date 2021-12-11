import {
  auth,
  fbProvider,
  gitProvider,
  googleProvider,
} from '../../firebase/firebaseSetup';
import { signInWithEmailAndPassword, signInWithPopup } from '@firebase/auth';
import { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Alert, Button, TextField } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { checkString } from '../../utils/inputChecks';

import googleLogo from '../../imgs/google-logo.png';
import fbLogo from '../../imgs/facebook-logo.png';
import gitLogo from '../../imgs/github-logo.png';
import './LogIn.css';
import './LogIn.module.css';

export default function LogIn() {
  const [errors, setErrors] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // if user is already logged in, redirect to home
  if (user) return <Redirect to="/home" />;

  const logUserIn = async (e) => {
    e.preventDefault();

    let email = e.target[0].value;
    const password = e.target[2].value;

    const errorList = [];
    // error checking
    try {
      email = checkString(email, 'Email', true, false);
    } catch (e) {
      errorList.push(e.toString());
    }
    try {
      checkString(password, 'Password', false, false);
    } catch (e) {
      errorList.push(e.toString());
    }

    // if there were errors, set errors
    if (errorList.length > 0) {
      setErrors(errorList);
      //clear fields
      document.getElementById('email').value = '';
      document.getElementById('password').value = '';
      return;
    }

    let result;
    try {
      result = await signInWithEmailAndPassword(auth, email, password);
      console.log(result);
      if (result.user.uid) setLoggedIn(true);
      else throw Error('couldnt log in');
    } catch (e) {
      setErrors(['Invalid login credentials.']);
      //clear fields
      document.getElementById('email').value = '';
      document.getElementById('password').value = '';
      return;
    }

    // store email in redux
    dispatch({
      type: 'LOG_IN',
      payload: email,
    });
  };

  const googleProviderSignIn = (e) => {
    e.preventDefault();
    providerSignIn(googleProvider);
  };
  const fbProviderSignIn = (e) => {
    // i may give up on facebook :(
    e.preventDefault();
    providerSignIn(fbProvider);
  };
  const gitProviderSignIn = (e) => {
    e.preventDefault();
    providerSignIn(gitProvider);
  };

  const providerSignIn = async (provider) => {
    // DBTODO - email already exists as regular user?

    let result;
    try {
      // try pop up - some browsers block
      result = await signInWithPopup(auth, provider);
    } catch (e) {
      console.log(e);
      // print a message asking to allow popups
      setErrors([
        'Please try again to sign in with a provider. You may have to allow pop-ups.',
      ]);
      return;
    }
    if (result && result.user && result.user.email) setErrors(null);
    else return;
    console.log(result);
    // DBTODO - make sure we have a record for this person in the db. otherwise we need to get a username from them & store info -> so maybe redirect to create-user page & make them "sign in" w google again?

    // store email in redux
    dispatch({
      type: 'LOG_IN',
      payload: result.user.email,
    });
  };

  if (loggedIn) return <Redirect to="/home" />;

  return (
    <div id="login-user">
      <h1>Log In</h1>
      <form onSubmit={logUserIn} id="login-user-form">
        <TextField id="email" required type="email" label="Email" />
        <TextField id="password" required type="password" label="Password" />
        <Button type="submit" variant="contained">
          Log in
        </Button>
      </form>

      <div className="provider-logos">
        <Button
          variant="contained"
          className="provider-logo"
          onClick={googleProviderSignIn}
        >
          <img
            src={googleLogo}
            alt="sign in with google"
            height={50}
            width={50}
          />
          Sign in with Google
        </Button>
        {/* <Button variant="contained" className='provider-logo' onClick={fbProviderSignIn}>
				<img src={fbLogo} alt="sign in with facebook" height={50} width={50} />
				Sign in with Facebook
			</Button> */}
        <Button
          variant="contained"
          className="provider-logo"
          onClick={gitProviderSignIn}
        >
          <img src={gitLogo} alt="sign in with github" height={50} width={50} />
          Sign in with GitHub
        </Button>
      </div>

      {errors && (
        <Alert severity="error" className="create-user-errors">
          <ul>
            {errors.map((error) => {
              error = error.replace('Error: ', '');
              return <li key={error}>{error}</li>;
            })}
          </ul>
        </Alert>
      )}

      <p>Test user: email: testing@test.com, password: test12</p>
      <p>
        Not a user yet? <a href="/create-user">Create Account</a>
      </p>
    </div>
  );
}

// google logo: https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.freepngimg.com%2Fthumb%2Fgoogle%2F66903-google-pay-gboard-platform-logo-cloud.png&f=1&nofb=1
// fb logo: https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.freepngimg.com%2Fthumb%2Ffacebook%2F65310-icons-media-fb-computer-facebook-social.png&f=1&nofb=1
