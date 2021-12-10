import { Alert, Button, Grid, List, ListItem, ListItemIcon, ListItemText, Modal, TextField } from "@mui/material"
import { useState } from "react";
import PersonIcon from '@mui/icons-material/Person';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import CloseIcon from '@mui/icons-material/Close';
import { useSelector, useDispatch } from "react-redux";
import { Redirect } from "react-router-dom";

import './Profile.css';
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword, deleteUser } from "firebase/auth";
import { auth } from "../../firebase/firebaseSetup";
import inputChecks from "../../inputChecks";
import LogIn from "../LogIn/LogIn";
import { Box } from "@mui/system";

const userData = {
	username: 'fakeuser',
	email: 'fakeuser@gmail.com',
	highScores: [10, 25],
	friends: ['fakeuser1', 'fakeuser2', 'fakeuser3']
}

// DBTODO pull data from database

export default function Profile () {
	// TODO if provider, only allow editing username, and display a thing that says provider instead of email/pass
	const [editUser, setEditUser] = useState(false);
	const [editEmail, setEditEmail] = useState(false);
	const [editPass, setEditPass] = useState(false);
	
	const [usernameError, setUsernameError] = useState('');
	const [emailError, setEmailError] = useState('');
	const [passError, setPassError] = useState('');

	const [openModal, setOpenModal] = useState(false);
	const [loginErrors, setLoginErrors] = useState(null);
	const [fieldToUpdate, setFieldToUpdate] = useState(null);
	const [redirect, setRedirect] = useState(false);

	const user = useSelector((state) => state.user);
	const dispatch = useDispatch();

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
	}

	const editProfile = async (e) => {
		e.preventDefault();
		//TODO check if anything actually changed

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
			newValue = inputChecks.checkString(newValue, fieldName, !isPW, isPW);
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
		
		// DBTODO edit user in db
	}

	const triggerDeleteUser = (e) => {
		e.preventDefault();
		// trigger reauth
		setFieldToUpdate({field:'delete'});
		setOpenModal(true);
		// DBTODO delete user in DB
	}

	const reAuth = async (e) => {
		e.preventDefault();

		setLoginErrors(null);

		let email = e.target[0].value;
		const password = e.target[2].value;

		const errorList = [];
		// error checking
		try {
			email = inputChecks.checkString(email, 'Email', true, false);
		} catch (e) {
			errorList.push(e.toString());
		}
		try {
			inputChecks.checkString(password, 'Password', false, false);
		} catch (e) {
			errorList.push(e.toString());
		}

		// if there were errors, set errors
		if (errorList.length>0) {
			setLoginErrors(errorList);
			return;
		}

		console.log(email, password);
		let result;
		try {
			const cred = EmailAuthProvider.credential(email,password);
			result = await reauthenticateWithCredential(auth.currentUser, cred);
		} catch (e) {
			setLoginErrors(['Invalid login credentials.']);
			return;
		}
		// make sure we got the token
		if (!result || !result.operationType==='reauthenticate') {
			setLoginErrors(['Something went wrong. Please try again.']);
			return;
		}

		if (fieldToUpdate.field==='email') {
			try {
				await updateEmail(auth.currentUser, fieldToUpdate.value);
			} catch (e) {
				console.log(e);
				setLoginErrors([e.toString()]);
				return;
			}
			userData.email = fieldToUpdate.value;
			// DBTODO update email in database
			setEditEmail(false);
			setOpenModal(false);
		} else if (fieldToUpdate.field==='pass') {
			try {
				await updatePassword(auth.currentUser, fieldToUpdate.value);
			} catch (e) {
				console.log(e);
				setLoginErrors([e.toString()]);
				return;
			}
			setEditPass(false);
			setOpenModal(false);
		} else if (fieldToUpdate.field==='delete') {
			alert('Are you sure you want to delete your account?');
			try {
				const result = await deleteUser(auth.currentUser);
				console.log(result);
				dispatch({
					type: 'LOG_OUT'
				})
				setRedirect(true);
				return;
			} catch (e) {
				console.log(e);
				setLoginErrors([e.toString()]);
			}
		}
		setFieldToUpdate(null);
		//TODO make sure all states are updating/resetting correctly
	}

	const handleClose = () => {
		setLoginErrors(null);
		setOpenModal(false);
	}

	if (redirect) return <Redirect to='/' />;

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
			</Grid>

			<div className="profile-list">
			<span>High Scores</span>
			<List>
				{userData.highScores.map((score, i) => (
					<ListItem disablePadding key={i}>
						<ListItemIcon><SportsScoreIcon /></ListItemIcon>
						<ListItemText primary={score} />
					</ListItem>
				))}
			</List>
			</div>

			<div className="profile-list">
			<span>Friends</span>
			<List>
				{userData.friends.map((friend, i) => (
					<ListItem disablePadding key={i}>
						<ListItemIcon><PersonIcon /></ListItemIcon>
						<ListItemText primary={friend} />
					</ListItem>
				))}
			</List>
			</div>

			<Button color="error" onClick={triggerDeleteUser}>Delete Account</Button>
		</div>
	)
}