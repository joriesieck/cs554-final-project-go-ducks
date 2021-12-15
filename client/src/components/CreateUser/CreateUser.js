import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { checkString, checkBool } from '../../utils/inputChecks';
import {
  addUser,
  getUserByEmail,
  getUserByName,
  removeUser,
} from '../../utils/backendCalls';
import {
  auth,
  googleProvider,
  gitProvider,
} from '../../firebase/firebaseSetup';
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  signInWithPopup,
  deleteUser,
} from '@firebase/auth';
import { Link, Redirect } from 'react-router-dom';
import Image from 'next/image';

import styles from './CreateUser.module.css';
import googleLogo from '../../imgs/google-logo.png';
import gitLogo from '../../imgs/github-logo.png';

export default function CreateUser() {
  const [errors, setErrors] = useState(null);
  const [created, setCreated] = useState(false);
  const [displayButton, setDisplayButton] = useState(true);
  const [email, setEmail] = useState(null);
  const [username, setUsername] = useState(null);
  const [emailExists, setEmailExists] = useState(false);
  const [storeAuthToken, setStoreAuthToken] = useState(null);
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  // if user is already logged in, redirect to home
  if (user) return <Redirect to="/home" />;

  const createUser = async (e) => {
    e.preventDefault();
    setErrors(null);

    let username = e.target[0].value;
    let email = e.target[2].value;
    const password = e.target[4].value;
    const optedForLeaderboard = e.target[6].checked;

    // error checking
    const errorList = [];
    try {
      username = checkString(username, 'Username', true, false);
    } catch (e) {
      errorList.push(e.toString());
    }
    try {
      email = checkString(email, 'Email', true, false);
    } catch (e) {
      errorList.push(e.toString());
    }
    try {
      checkString(password, 'Password', false, true);
    } catch (e) {
      errorList.push(e.toString());
    }
    try {
      checkBool(optedForLeaderboard, 'optedForLeaderboard');
    } catch (e) {
      errorList.push(e.toString());
    }
    // make sure password is at least 6 characters
    if (password.length < 6)
      errorList.push('Password must be at least 6 characters.');

    // if there were errors, set errors
    if (errorList.length > 0) {
      setErrors(errorList);
      return;
    }

    // make sure user doesn't exist in firebase
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0)
        throw Error('Email address already associated with an account.');
    } catch (e) {
      console.log(e);
      setErrors([e.toString()]);
      return;
    }

    let result;
    let authToken;
    try {
      result = await createUserWithEmailAndPassword(auth, email, password);
      if (!result.user.uid)
        throw Error(
          'Something went wrong creating your account, please try again.'
        );
      authToken = result.user.accessToken;
    } catch (e) {
      console.log(e);
      setErrors([e.toString()]);
      return;
    }

    // make sure username not already in db
    try {
      const result = await getUserByName(username, authToken);
      if (result && result._id) {
        await deleteUser(auth.currentUser);
        setErrors([
          'Sorry, that username is in use by someone else. Please pick a new one.',
        ]);
        return;
      }
    } catch (e) {
      // make sure error is doesn't exist
      if (!e.response || !e.response.data || !e.response.data.error) {
        setErrors([e.toString()]);
        return;
      }
      if (!e.response.data.error.includes('not found') && !e.status !== 404) {
        setErrors([e.response.data.error]);
        return;
      }
    }

    // add user to db
    try {
      const result = await addUser(
        username,
        email,
        optedForLeaderboard,
        authToken
      );
      console.log(result);
    } catch (e) {
      if (!e.response || !e.response.data || !e.response.data.error) {
        setErrors([e.toString()]);
        return;
      }
      setErrors([e.response.data.error]);
      return;
    }

    // store authToken
    dispatch({
      type: 'UPDATE_TOKEN',
      payload: authToken,
    });
    // store email in redux
    dispatch({
      type: 'LOG_IN',
      payload: email,
    });

    // redirect to home page
    setCreated(true);
  };

  const googleProviderSignIn = (e) => {
    e.preventDefault();
    providerSignIn(googleProvider);
  };
  const gitProviderSignIn = (e) => {
    e.preventDefault();
    providerSignIn(gitProvider);
  };

  const providerSignIn = async (provider) => {
    let result;
    let authToken;
    try {
      // try pop up - some browsers block
      result = await signInWithPopup(auth, provider);
      authToken = result.user.accessToken;
    } catch (e) {
      // print a message asking to allow popups
      setErrors([
        'Please allow pop-ups and try again to sign in with a provider.',
      ]);
      return;
    }
    if (result && result.user && result.user.email) setErrors(null);
    else {
      // if user exits popup
      setErrors([
        "Looks like we couldn't sign you up. Please try again, or try creating an account using email and password.",
      ]);
      return;
    }

    // check if email already exists in db
    let user;
    try {
      user = await getUserByEmail(result.user.email, authToken);
      if (user && user._id) {
        // store email
        setEmail(result.user.email);
        setUsername(user.username);
        setEmailExists(true);
        return;
      }
    } catch (e) {
      if (!e.response || !e.response.data || !e.response.data.error) {
        setErrors([e.toString()]);
        return;
      }
      if (!e.response.data.error.includes('not found') && !e.status !== 404) {
        setErrors([e.response.data.error]);
        return;
      }
    }

    // store auth token
    setStoreAuthToken(authToken);
    // store email
    setEmail(result.user.email);
    // prompt for username
    setDisplayButton(false);
  };

  const storeProviderInfo = async (e) => {
    e.preventDefault();

    let username = e.target[0].value;
    const optedForLeaderboard = e.target[2].checked;
    // error checking
    const errorList = [];
    try {
      username = checkString(username, 'Username', true, false);
    } catch (e) {
      errorList.push(e.toString());
    }
    try {
      checkBool(optedForLeaderboard, 'OptedForLeaderboard');
    } catch (e) {
      errorList.push(e.toString());
    }
    if (errorList.length > 0) {
      setErrors(errorList);
      return;
    }

    // make sure username not already in db
    try {
      const result = await getUserByName(username, storeAuthToken);
      if (result && result._id) {
        await deleteUser(auth.currentUser);
        setErrors([
          'Sorry, that username is in use by someone else. Please pick a new one.',
        ]);
        return;
      }
    } catch (e) {
      // make sure error is doesn't exist
      if (!e.response || !e.response.data || !e.response.data.error) {
        setErrors([e.toString()]);
        return;
      }
      if (!e.response.data.error.includes('not found') && !e.status !== 404) {
        setErrors([e.response.data.error]);
        return;
      }
    }

    // add user to database
    try {
      const result = await addUser(
        username,
        email,
        optedForLeaderboard,
        storeAuthToken
      );
      console.log(result);
    } catch (e) {
      if (!e.response || !e.response.data || !e.response.data.error) {
        setErrors([e.toString()]);
        return;
      }
      setErrors([e.response.data.error]);
      return;
    }

    dispatch({
      type: 'UPDATE_TOKEN',
      payload: storeAuthToken,
    });
    dispatch({
      type: 'LOG_IN',
      payload: email,
    });

    // redirect to homepage
    setCreated(true);
  };

  const preserveOldAccount = () => {
    dispatch({
      type: 'UPDATE_TOKEN',
      payload: storeAuthToken,
    });
    dispatch({
      type: 'LOG_IN',
      payload: email,
    });

    // redirect to homepage
    setCreated(true);
  };

  const dontPreserveOldAccount = async () => {
    // delete old record in database
    try {
      await removeUser(username, storeAuthToken);
    } catch (e) {
      setErrors([
        `Sorry, something went wrong deleting your old account: ${e.toString()}. Please try again later.`,
      ]);
      return;
    }
    setDisplayButton(false);
    setEmailExists(false);
  };

  if (created) return <Redirect to="/home" />;

  return (
    <div className={styles.createUser}>
      <h1>Create User</h1>
      {displayButton && (
        <form onSubmit={createUser} className={styles.createUserForm}>
          <TextField id="username" required label="Username" />
          <TextField id="email" required type="email" label="Email" />
          <TextField
            id="password"
            required
            type="password"
            label="Password"
            helperText="Must be at least 6 characters."
          />
          <FormControlLabel
            control={<Checkbox id="optedForLeaderboard" />}
            label="Include me in the leaderboard (you can change this later)"
          />
          <Button type="submit" variant="contained">
            Create User
          </Button>
        </form>
      )}

      {displayButton && (
        <div className={styles.providerLogos}>
          <Button
            variant="contained"
            className={styles.providerLogo}
            onClick={googleProviderSignIn}
          >
            <Image
              src={googleLogo}
              alt="sign in with google"
              height={50}
              width={50}
            />
            Sign up with Google
          </Button>
          {/* <Button variant="contained" className='provider-logo' onClick={fbProviderSignIn}>
				<img src={fbLogo} alt="sign in with facebook" height={50} width={50} />
				Sign in with Facebook
			</Button> */}
          <Button
            variant="contained"
            className={styles.providerLogo}
            onClick={gitProviderSignIn}
          >
            <Image
              src={gitLogo}
              alt="sign in with github"
              height={50}
              width={50}
            />
            Sign up with GitHub
          </Button>
        </div>
      )}

      {!displayButton && (
        <>
          <p>
            Thanks for signing up! We still need a username to complete your
            registration.
          </p>
          <form onSubmit={storeProviderInfo}>
            <TextField id="provider-username" required label="Username" />
            <FormControlLabel
              control={<Checkbox id="provider-optedForLeaderboard" />}
              label="Include me in the leaderboard (you can change this later)"
            />
            <Button type="submit" variant="contained">
              Complete signup
            </Button>
          </form>
        </>
      )}

      {emailExists && (
        <>
          <p>
            Looks like you previously had an account associated with this email
            address. Do you want to transfer your data to this account, or start
            over?
          </p>
          <Button onClick={dontPreserveOldAccount}>Start over</Button>
          <Button onClick={preserveOldAccount}>Transfer data</Button>
        </>
      )}

      {errors && (
        <Alert severity="error" className={styles.createUserErrors}>
          <ul>
            {errors.map((error) => {
              error = error.replace('Error: ', '');
              return <li key={error}>{error}</li>;
            })}
          </ul>
        </Alert>
      )}

      <p>
        Already have an account? <Link to="/">Log in</Link> instead.
      </p>
    </div>
  );
}
