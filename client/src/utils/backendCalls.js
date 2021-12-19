import axios from 'axios';

const siteUrl = 'http://localhost:3001';

async function getAllUsers() {
	const { data } = await axios.get(`${siteUrl}/users`);
	return data;
}

async function getUserById (id) {
	const { data } = await axios.get(`${siteUrl}/users/id/${id}`);
	return data; 
}

async function getUserByName (username) {
	const {data} = await axios.get(`${siteUrl}/users/username/${username}`);
	return data;
}

async function getUserByEmail (email) {
	const {data} = await axios.get(`${siteUrl}/users/email/${email}`);
	return data;
}

async function searchUsersByName(searchTerm) {
	const { data } = await axios.post(`${siteUrl}/users/search`, {
		searchTerm
	});
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
	const {data} = await axios.patch(`${siteUrl}/users/remove-pending-friend`, {
		username,
		pendingToRemove
	});
	return data;
}

async function acceptPendingFriend (username, friendToAccept) {
	const {data} = await axios.patch(`${siteUrl}/users/accept-friend`, {
		username,
		friendToAccept
	});
	return data;
}

async function getAllFriends (username) {
	const {data} = await axios.get(`${siteUrl}/users/friends/${username}`);
	return data;
}

async function getAllPendingFriends (username) {
	const {data} = await axios.get(`${siteUrl}/users/pending-friends/${username}`);
	return data;
}

async function addFriend (username, friendToAdd) {
	const {data} = await axios.patch(`${siteUrl}/users/add-friend`, {
		username,
		friendToAdd
	});
	return data;
}

async function getLeaderboard () {
	const {data} = await axios.get(`${siteUrl}/users/leaderboard`);
	return data;
}

export {
	getUserById,
	getAllUsers,
	getUserByName,
	getUserByEmail,
	searchUsersByName,
	addUser,
	removeUser,
	editUserInfo,
	removeFriend,
	removePendingFriend,
	acceptPendingFriend,
	getAllFriends,
	getAllPendingFriends,
	addFriend,
	getLeaderboard
}