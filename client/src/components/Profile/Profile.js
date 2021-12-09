import { Button, Grid, List, ListItem, ListItemIcon, ListItemText, TextField } from "@mui/material"
import { useState } from "react";
import PersonIcon from '@mui/icons-material/Person';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";

import './Profile.css';

const userData = {
	username: 'fakeuser',
	email: 'fakeuser@gmail.com',
	password: 'blahblah',
	highScores: [10, 25],
	friends: ['fakeuser1', 'fakeuser2', 'fakeuser3']
}

// TODO pull data from database

export default function Profile () {
	const [editUser, setEditUser] = useState(false);
	const [editEmail, setEditEmail] = useState(false);
	const [editPass, setEditPass] = useState(false);
	const user = useSelector((state) => state.user);
	// if user is not logged in, redirect to login
	if (!user) return <Redirect to="/" />;

	const toggleEdit = (e) => {
		e.preventDefault();

		if (e.target.id==='edit-username') setEditUser(!editUser);
		else if (e.target.id==='edit-email') setEditEmail(!editEmail);
		else if (e.target.id==='edit-password') setEditPass(!editPass);
	}

	const editProfile = (e) => {
		e.preventDefault();
		// get the field we're editing
		const fieldToEdit = e.target.id;
		console.log(fieldToEdit);
		// get the new value
		const newValue = e.target[0].value;
		console.log(newValue);
		// edit the user and toggle edit
		if (fieldToEdit==='save-username') {
			userData.username = newValue;
			setEditUser(false);
		}
		if (fieldToEdit==='save-email') {
			userData.email = newValue;
			setEditEmail(false);
		}
		if (fieldToEdit==='save-password') {
			userData.password = newValue;
			setEditPass(false);
		}
		// TODO edit user in fb (if email or password changed)
		// TODO edit user in db
	}

	const deleteUser = (e) => {
		e.preventDefault();
		console.log('delete user');
		// TODO delete user in firebase
		// TODO delete user in DB
	}
	return (
		<div id="profile">
			<h1>Profile</h1>
			<Grid className="profile-list">
			<Grid item xs={12} className="profile-editable">
				{!editUser && <><Grid item xs={2}>Username:</Grid><Grid item xs={6}>{userData.username}</Grid></>}
				{editUser && <form id="save-username" onSubmit={editProfile}>
				<TextField
					id="username"
					label="Username"
					defaultValue={userData.username}
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
				/>
				<Button type="submit">Save</Button>
				</form>}
				<Button id="edit-email" onClick={toggleEdit}>{editEmail ? 'Discard' : 'Edit'}</Button>
			</Grid>
			<Grid item xs={12} className="profile-editable">
				{!editPass && <><Grid item xs={2}>Password:</Grid><Grid item xs={6}>{'*'.repeat(userData.password.length)}</Grid></>}
				{editPass && <form id="save-password" onSubmit={editProfile}>
				<TextField
					id="password"
					label="Password"
					defaultValue={userData.password}
					type="password"
				/>
				<Button type="submit">Save</Button>
				</form>}
				<Button id="edit-password" onClick={toggleEdit}>{editPass ? 'Discard' : 'Edit'}</Button>
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

			<Button color="error" onClick={deleteUser}>Delete Account</Button>
		</div>
	)
}