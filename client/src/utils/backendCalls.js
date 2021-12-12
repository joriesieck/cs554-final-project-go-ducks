import axios from 'axios';

const siteUrl = 'http://localhost:3001';

async function getUserByName (username) {
	let data;
	({data} = await axios.get(`${siteUrl}/users/username/${username}`));
	return data;
}

async function getUserByEmail (email) {
	let data;
	({data} = await axios.get(`${siteUrl}/users/email/${email}`));
	return data;
}

async function addUser (username, email, optedForLeaderboard) {
	let data;
	({data} = await axios.post(`${siteUrl}/users`, {
		username,
		email,
		optedForLeaderboard
	}));
	return data;
}

async function removeUser (username) {
	let {data} = await axios.delete(`${siteUrl}/users/${username}`);
	return data;
}

async function editUserInfo ({originalEmail, username, newEmail, optedForLeaderboard}) {
	let {data} = await axios.patch(`${siteUrl}/users/edit-user`, {
		originalEmail,
		username,
		newEmail,
		optedForLeaderboard
	});
	return data;
}

async function removeFriend (username, friendToRemove) {
	let {data} = await axios.patch(`${siteUrl}/users/remove-friend`, {
		username,
		friendToRemove
	});
	return data;
}

export {
	getUserByName,
	getUserByEmail,
	addUser,
	removeUser,
	editUserInfo,
	removeFriend
}