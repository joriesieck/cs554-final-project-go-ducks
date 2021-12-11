import axios from 'axios';

async function getUserByName (username) {
	let data;
	try {
		({data} = await axios.get(`http://localhost:3001/users/${username}`));
	} catch (e) {
		return e;
	}
	return data;
}

export {
	getUserByName
}