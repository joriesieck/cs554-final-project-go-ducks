import { Alert, Button, Checkbox, CircularProgress, FormControlLabel, Grid, List, ListItem, ListItemIcon, ListItemText, Modal, TextField } from "@mui/material"
import { useEffect, useState } from "react";
import PersonIcon from '@mui/icons-material/Person';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import { useSelector, useDispatch } from "react-redux";
import { Redirect } from "react-router-dom";
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword, deleteUser, fetchSignInMethodsForEmail, signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { auth, gitProvider, googleProvider } from "../../firebase/firebaseSetup";
import { checkString } from "../../utils/inputChecks";
import { Box } from "@mui/system";
import { getUserByEmail } from '../../utils/backendCalls';
import googleLogo from '../../imgs/google-logo.png';
import gitLogo from '../../imgs/github-logo.png';
import './Profile.css';

export default function Profile () {
	const [editUser, setEditUser] = useState(false);
	const [editEmail, setEditEmail] = useState(false);
	const [editPass, setEditPass] = useState(false);
	const [editLeaderboard, setEditLeaderboard] = useState(false);
	
	const [usernameError, setUsernameError] = useState('');
	const [emailError, setEmailError] = useState('');
	const [passError, setPassError] = useState('');

	const [openModal, setOpenModal] = useState(false);
	const [loginErrors, setLoginErrors] = useState(null);
	const [fieldToUpdate, setFieldToUpdate] = useState(null);
	const [redirect, setRedirect] = useState(false);

	const [provider, setProvider] = useState(null);
	const [providerError, setProviderError] = useState(null);
	const [deleting, setDeleting] = useState(false);

	const [userData, setUserData] = useState(null);
	const [error, setError] = useState(null);

	const user = useSelector((state) => state.user);
	const dispatch = useDispatch();

	// check if the user logged in with a provider
	useEffect(() => {
		async function fetchProviders () {
			const result = await fetchSignInMethodsForEmail(auth, user);
			console.log(result);
			setProvider(result[0] || 'no-account');
		}
		fetchProviders();
	}, []);

	// get the user from the db
	useEffect(() => {
		async function fetchUserData () {
			let data;
			try {
				data = await getUserByEmail(user);
				console.log(data);
				setUserData(data);
			} catch (e) {
				if (!e.response || !e.response.data || !e.response.data.error) {
					setError(e.toString());
					return;
				}
				setError(e.response.data.error);
				return;
			}
		}
		fetchUserData();
	}, []);

	// if user is not logged in, redirect to login
	if (!user) return <Redirect to="/" />;

	const toggleEdit = (e) => {
		e.preventDefault();

		if (e.target.id==='edit-username') {
			setUsernameError('');
			setEditUser(!editUser);
		}
		else if (e.target.id==='edit-email') {
			setEmailError('');
			setEditEmail(!editEmail);
		}
		else if (e.target.id==='edit-password') {
			setPassError('');
			setEditPass(!editPass);
		}
		else if (e.target.id==='edit-leaderboard') {
			setEditLeaderboard(!editLeaderboard);
		}
	}

	const editProfile = async (e) => {
		e.preventDefault();

		// get the field we're editing
		const fieldToEdit = e.target.id;
		if (fieldToEdit==='save-username') setUsernameError('');
		else if (fieldToEdit==='save-email') setEmailError('');
		else if (fieldToEdit==='save-password') setPassError('');

		// get the new value
		let newValue = e.target[0].value;
		
		// error checking
		try {
			const isPW = fieldToEdit==='save-password';
			const firstChar = fieldToEdit.charAt(5);
			const fieldName = fieldToEdit.replace('save-', '').replace(firstChar, firstChar.toUpperCase());
			newValue = checkString(newValue, fieldName, !isPW, isPW);
			if (isPW && newValue.length<6) throw Error('Password must be at least 6 characters.');
		} catch (e) {
			if (fieldToEdit==='save-username') setUsernameError(e.toString());
			else if (fieldToEdit==='save-email') setEmailError(e.toString());
			else if (fieldToEdit==='save-password') setPassError(e.toString());
			return;
		}

		// edit the user and toggle edit
		if (fieldToEdit==='save-username') {
			userData.username = newValue;
			// DBTODO edit user in db
			setEditUser(false);
		}
		if (fieldToEdit==='save-email') {
			// prompt for login credentials
			setOpenModal(true);
			setFieldToUpdate({
				field: 'email',
				value: newValue
			});
			return;
		}
		if (fieldToEdit==='save-password') {
			setOpenModal(true);
			setFieldToUpdate({
				field: 'pass',
				value: newValue
			});
			return;
		}
	}

	const toggleLeaderboard = (e) => {
		e.preventDefault();
		
		const clickedCheckbox = e.target[0].checked;

		if (clickedCheckbox) {
			userData.optedForLeaderboard = !userData.optedForLeaderboard;
			// DBTODO edit user in database
			
		}
		setEditLeaderboard(false);
	}

	const triggerDeleteUser = (e) => {
		e.preventDefault();
		// loading screen
		setDeleting(true);
		// trigger reauth
		setFieldToUpdate({field:'delete'});
		// if an email user, open modal
		if (provider==='password') setOpenModal(true);
		// otherwise just directly trigger the popup
		providerReAuth();
		// DBTODO delete user in DB
	}

	const providerReAuth = async () => {
		let providerToAuth;
		if (provider==='google.com') providerToAuth = googleProvider;
		else if (provider==='github.com') providerToAuth = gitProvider;
		else {
			setDeleting(false);
			return;
		}

		let result;
		try {
			// try pop up - some browsers block
			result = await signInWithPopup(auth, providerToAuth);
		} catch (e) {
			console.log(e);
			// print a message asking to allow popups
			setProviderError('Please allow pop-ups and try again to sign in with a provider.');
		}
		if (result && result.user && result.user.email) setProviderError(null);
		console.log(result);
		// get the credential
		try {
			let cred;
			if (provider==='google.com') cred = GoogleAuthProvider.credentialFromResult(result);
			else if (provider==='github.com') cred = GithubAuthProvider.credentialFromResult(result);
			result = await reauthenticateWithCredential(auth.currentUser, cred);
			console.log(result);
		} catch (e) {
			console.log(e);
			setProviderError('Invalid login credentials.');
			setDeleting(false);
			return;
		}
		// make sure we got the token
		if (!result || !result.operationType==='reauthenticate') {
			setProviderError('Something went wrong. Please try again.');
			setDeleting(false);
			return;
		}
		// delete the user
		try {
			const result = await deleteUser(auth.currentUser);
			console.log(result);
			dispatch({
				type: 'LOG_OUT'
			})
			setRedirect(true);
			setDeleting(false);
			return;
		} catch (e) {
			console.log(e);
			setProviderError(e.toString());
		}
		setFieldToUpdate(null);
	}

	const reAuth = async (e) => {
		e.preventDefault();

		setLoginErrors(null);

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
		if (errorList.length>0) {
			setLoginErrors(errorList);
			setDeleting(false);
			return;
		}

		let result;
		try {
			const cred = EmailAuthProvider.credential(email,password);
			result = await reauthenticateWithCredential(auth.currentUser, cred);
		} catch (e) {
			setLoginErrors(['Invalid login credentials.']);
			setDeleting(false);
			return;
		}
		// make sure we got the token
		if (!result || !result.operationType==='reauthenticate') {
			setLoginErrors(['Something went wrong. Please try again.']);
			setDeleting(false);
			return;
		}

		if (fieldToUpdate.field==='email') {
			// DBTODO update email in database
			try {
				console.log('update email in firebase - commented out since it doesnt work in db yet');
				// await updateEmail(auth.currentUser, fieldToUpdate.value);
			} catch (e) {
				setLoginErrors([e.toString()]);
				setDeleting(false);
				return;
			}
			userData.email = fieldToUpdate.value;
			setEditEmail(false);
			setOpenModal(false);
		} else if (fieldToUpdate.field==='pass') {
			try {
				await updatePassword(auth.currentUser, fieldToUpdate.value);
			} catch (e) {
				setLoginErrors([e.toString()]);
				setDeleting(false);
				return;
			}
			setEditPass(false);
			setOpenModal(false);
		} else if (fieldToUpdate.field==='delete') {
			//DBTODO delete user from database
			try {
				console.log('delete user in firebase - commented out since it doesnt work in db yet');
				// await deleteUser(auth.currentUser);
				dispatch({
					type: 'LOG_OUT'
				})
				setRedirect(true);
				setDeleting(false);
				return;
			} catch (e) {
				setLoginErrors([e.toString()]);
			}
		}
		setDeleting(false);
		setFieldToUpdate(null);
	}

	const handleClose = () => {
		setLoginErrors(null);
		setOpenModal(false);
		setDeleting(false);
	}

	if (redirect) return <Redirect to='/' />;

	if (error) return <Alert severity="error">{error}</Alert>;

	if (!provider || deleting || !userData) return <div className="profile-loading"><CircularProgress /></div>;

	return (
		<div id="profile">
			<Modal
				open={openModal}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
				className={`profile-reauth-modal${loginErrors ? ' profile-reauth-modal-errors' : ''}`}	
			>
				<Box className='profile-reauth-box'>
					<Grid container>
						<Grid item xs={1}></Grid>
						<Grid item xs={10}><h1 id="modal-modal-title">Log In</h1></Grid>
						<Grid item xs={1}><CloseIcon id='profile-reauth-close' onClick={handleClose} /></Grid>
					</Grid>

					<Alert id="modal-modal-description" severity="info">Please log in again to save changes.</Alert>
					<form onSubmit={reAuth} id="reauth-user-form">
						<TextField id="reauth-email" required type="email" label="Email" />
						<TextField id="reauth-password" required type="password" label="Password" />
						<Button type="submit" variant="contained">Log in</Button>
					</form>
					{loginErrors && <Alert severity="error" className="create-user-errors">
						<ul>
							{loginErrors.map((error) => {
								error = error.replace('Error: ', '');
								return <li key={error}>{error}</li>
							})}
						</ul>
					</Alert>}
				</Box>
			</Modal>

			<h1>Profile</h1>
			<Grid className="profile-list">
			<h2>Login Credentials</h2>
			<Grid item xs={12} className="profile-editable">
				{!editUser && <><Grid item xs={2}>Username:</Grid><Grid item xs={6}>{userData.username}</Grid></>}
				{editUser && <form id="save-username" onSubmit={editProfile}>
				<TextField
					id="username"
					label="Username"
					defaultValue={userData.username}
					error={usernameError!==''}
					helperText={usernameError.replace('Error: ', '')}
				/>
				<Button type="submit">Save</Button>
				</form>}
				<Button id="edit-username" onClick={toggleEdit}>{editUser ? 'Discard' : 'Edit'}</Button>
			</Grid>

			{/* email/password */}
			{provider==='password' && <>
			<Grid item xs={12} className="profile-editable">
				{!editEmail && <><Grid item xs={2}>Email:</Grid><Grid item xs={6}>{userData.email}</Grid></>}
				{editEmail && <form id="save-email" onSubmit={editProfile}>
				<TextField
					id="email"
					label="Email"
					defaultValue={userData.email}
					type="email"
					error={emailError!==''}
					helperText={emailError.replace('Error: ', '')}
				/>
				<Button type="submit">Save</Button>
				</form>}
				<Button id="edit-email" onClick={toggleEdit}>{editEmail ? 'Discard' : 'Edit'}</Button>
			</Grid>
			<Grid item xs={12} className="profile-editable">
				{editPass && <form id="save-password" onSubmit={editProfile}>
				<TextField
					id="password"
					label="New Password"
					type="password"
					error={passError!==''}
					helperText={passError.replace('Error: ', '')}
				/>
				<Button type="submit">Save</Button>
				</form>}
				<Button id="edit-password" className={editPass ? 'discard-password' : 'change-password'} onClick={toggleEdit}>{editPass ? 'Discard' : 'Change Password'}</Button>
			</Grid>
			</>}

			{/* google */}
			{provider==='google.com' && <div className='profile-provider'>
				<img src={googleLogo} alt='google logo' height={50} width={50} />
				<p>Edit your sign-in information on <a href='https://www.google.com/' target='_blank' rel='noreferrer'>Google <OpenInNewIcon style={{width:'15px', height:'15px'}} /></a></p>
			</div>}

			{/* github */}
			{provider==='github.com' && <div className='profile-provider'>
				<img src={gitLogo} alt='github logo' height={50} width={50} />
				<p>Edit your sign-in information on <a href='https://github.com/' target='_blank' rel='noreferrer'>GitHub <OpenInNewIcon style={{width:'15px', height:'15px'}} /></a></p>
			</div>}

			{/* no account */}
			{provider==='no-account' && <Alert severity="error">
				Looks like you don't have an account. <a href='/create-user'>Create one here</a>.
			</Alert>}
			</Grid>

			<div className="profile-list">
			<h2>High Scores</h2>
			<Grid item className="profile-editable profile-leaderboard">
				<Grid item xs={1}><LeaderboardIcon /></Grid>
				{!editLeaderboard && <Grid item xs={8}>{`You are${userData.optedForLeaderboard ? '' : ' not'} participating in the leaderboard`}</Grid>}
				{editLeaderboard && <form id="save-leaderboard" onSubmit={toggleLeaderboard}>
					<FormControlLabel label={`${userData.optedForLeaderboard ? 'Remove me from' : 'Add me to'} the leaderboard`} control={<Checkbox />} />
					<Button type="submit">Save</Button>
				</form>}
				<Button id="edit-leaderboard" onClick={toggleEdit}>{editLeaderboard ? 'Discard' : 'Change'}</Button>
			</Grid>
			{userData.high_scores.length>0 && <List>
				{userData.high_scores.map((score, i) => (
					<ListItem disablePadding key={i}>
						<ListItemIcon><SportsScoreIcon /></ListItemIcon>
						<ListItemText primary={score} />
					</ListItem>
				))}
			</List>}
			{userData.high_scores.length<=0 && <p>No high scores to show.</p>}
			</div>

			<div className="profile-list">
			<h2>Friends</h2>
			{userData.friends.length>0 && <List>
				{userData.friends.map((friend, i) => (
					<ListItem disablePadding key={i}>
						<ListItemIcon><PersonIcon /></ListItemIcon>
						<ListItemText primary={friend} />
					</ListItem>
				))}
			</List>}
			{userData.friends.length<=0 && <p>No friends to show.</p>}
			</div>
			{/* DBTODO remove friends/pending friends */}
			<div className="profile-list">
			<h2>Pending Friends</h2>
			{userData.pending_friends.length>0 && <List>
				{userData.pending_friends.map((friend, i) => (
					<ListItem disablePadding key={i}>
						<ListItemIcon><PersonIcon /></ListItemIcon>
						<ListItemText primary={friend} />
					</ListItem>
				))}
			</List>}
			{userData.pending_friends.length<=0 && <p>No pending friends to show.</p>}
			</div>

			{providerError && <Alert severity="error" className="create-user-errors">
				{providerError}
			</Alert>}

			<Button color="error" onClick={triggerDeleteUser}>Delete Account</Button>
		</div>
	)
}