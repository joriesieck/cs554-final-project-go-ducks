import axios from 'axios';

const siteUrl = 'http://localhost:3001';

async function getUserByName (username) {
	let data;
	({data} = await axios.get(`${siteUrl}/users/username/${username}`));
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

export {
	getUserByName,
	addUser
}