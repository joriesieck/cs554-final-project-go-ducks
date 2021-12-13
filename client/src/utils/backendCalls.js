import axios from 'axios';

const siteUrl = 'http://localhost:3001';

async function getUserByName (username) {
	const {data} = await axios.get(`${siteUrl}/users/username/${username}`);
	return data;
}

async function getUserByEmail (email) {
	const {data} = await axios.get(`${siteUrl}/users/email/${email}`);
	return data;
}

async function addUser (username, email, optedForLeaderboard) {
	const {data} = await axios.post(`${siteUrl}/users`, {
		username,
		email,
		optedForLeaderboard
	});
	return data;
}

async function removeUser (username) {
	const {data} = await axios.delete(`${siteUrl}/users/${username}`);
	return data;
}

async function editUserInfo ({originalEmail, username, newEmail, optedForLeaderboard}) {
	const {data} = await axios.patch(`${siteUrl}/users/edit-user`, {
		originalEmail,
		username,
		newEmail,
		optedForLeaderboard
	});
	return data;
}

async function removeFriend (username, friendToRemove) {
	const {data} = await axios.patch(`${siteUrl}/users/remove-friend`, {
		username,
		friendToRemove
	});
	return data;
}

async function removePendingFriend (username, pendingToRemove) {
	const {data} = await axios.patch(`${siteUrl}`)
}

export {
	getUserByName,
	getUserByEmail,
	addUser,
	removeUser,
	editUserInfo,
	removeFriend
}