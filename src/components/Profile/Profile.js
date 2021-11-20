import { Button, List, ListItem, ListItemText, TextField } from "@mui/material"
import { useState } from "react";

const userData = {
	username: 'fakeuser',
	email: 'fakeuser@gmail.com',
	password: 'blahblah',
	highScores: [10, 25],
	friends: ['fakeuser1', 'fakeuser2', 'fakeuser3']
}

// TODO styling
// TODO pull data from database/firebase

export default function Profile () {
	const [editUser, setEditUser] = useState(false);
	const [editEmail, setEditEmail] = useState(false);
	const [editPass, setEditPass] = useState(false);

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
		<>
			<h1>Profile</h1>
			<div>
				{!editUser && <span>Username: {userData.username}</span>}
				{editUser && <form id="save-username" onSubmit={editProfile}>
				<TextField
					id="username"
					label="Username"
					defaultValue={userData.username}
				/>
				<Button type="submit">Save</Button>
				</form>}
				<Button id="edit-username" onClick={toggleEdit}>{editUser ? 'Discard' : 'Edit'}</Button>
			</div>
			<div>
				{!editEmail && <span>Email: {userData.email}</span>}
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
			</div>
			<div>
				{!editPass && <span>Password: {'*'.repeat(userData.password.length)}</span>}
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
			</div>

			<div>
			<span>High Scores</span>
			<List>
				{userData.highScores.map((score) => (
					<ListItem>
						<ListItemText primary={score} />
					</ListItem>
				))}
			</List>
			</div>

			<div>
			<span>Friends</span>
			<List>
				{userData.friends.map((friend) => (
					<ListItem>
						<ListItemText primary={friend} />
					</ListItem>
				))}
			</List>
			</div>

			<Button onClick={deleteUser}>Delete Account</Button>
		</>
	)
}