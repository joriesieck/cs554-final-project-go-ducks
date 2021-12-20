import axios from 'axios';

const siteUrl = 'http://localhost:3001';

async function getAllUsers(authToken) {
	const { data } = await axios.get(`${siteUrl}/users`,
  {
    headers: {
      authToken,
    },
  });
	return data;
}

async function getUserById (id, authToken) {
	const { data } = await axios.get(`${siteUrl}/users/id/${id}`,
  {
    headers: {
      authToken,
    },
  });
	return data; 
}

async function getUserByName (username, authToken) {
	const {data} = await axios.get(`${siteUrl}/users/username/${username}`,
  {
    headers: {
      authToken,
    },
  });
	return data;
}

async function getUserByEmail(email, authToken) {
  const { data } = await axios.get(`${siteUrl}/users/email/${email}`, {
    headers: {
      authToken,
    },
  });
  return data;
}

async function searchUsersByName(searchTerm, authToken) {
	const { data } = await axios.post(`${siteUrl}/users/search`, {
		searchTerm
	},
  {
    headers: {
      authToken,
    },
  });
	return data;
}

async function addUser (username, email, optedForLeaderboard, authToken) {
	const {data} = await axios.post(`${siteUrl}/users`, {
		username,
		email,
		optedForLeaderboard
	},
  {
    headers: {
      authToken,
    },
  });
	return data;
}

async function removeUser(username, authToken) {
  const { data } = await axios.delete(`${siteUrl}/users/${username}`, {
    headers: {
      authToken,
    },
  });
  return data;
}

async function editUserInfo({
  originalEmail,
  username,
  newEmail,
  optedForLeaderboard,
  authToken,
}) {
  const { data } = await axios.patch(
    `${siteUrl}/users/edit-user`,
    {
      originalEmail,
      username,
      newEmail,
      optedForLeaderboard,
    },
    {
      headers: {
        authToken,
      },
    }
  );
  return data;
}

async function removeFriend(username, friendToRemove, authToken) {
  const { data } = await axios.patch(
    `${siteUrl}/users/remove-friend`,
    {
      username,
      friendToRemove,
    },
    {
      headers: {
        authToken,
      },
    }
  );
  return data;
}

async function removePendingFriend(username, pendingToRemove, authToken) {
  const { data } = await axios.patch(
    `${siteUrl}/users/remove-pending-friend`,
    {
      username,
      pendingToRemove,
    },
    {
      headers: {
        authToken,
      },
    }
  );
  return data;
}

async function acceptPendingFriend(username, friendToAccept, authToken) {
  const { data } = await axios.patch(
    `${siteUrl}/users/accept-friend`,
    {
      username,
      friendToAccept,
    },
    {
      headers: {
        authToken,
      },
    }
  );
  return data;
}

async function getAllFriends(username, authToken) {
  const { data } = await axios.get(`${siteUrl}/users/friends/${username}`, {
    headers: {
      authToken,
    },
  });
  return data;
}

async function getAllPendingFriends(username, authToken) {
  const { data } = await axios.get(
    `${siteUrl}/users/pending-friends/${username}`,
    {
      headers: {
        authToken,
      },
    }
  );
  return data;
}

async function addFriend (username, friendToAdd, authToken) {
	const {data} = await axios.patch(`${siteUrl}/users/add-friend`, {
		username,
		friendToAdd
	}, {
    headers: {
      authToken
    }
  });
	return data;
}

async function getLeaderboard (authToken) {
	const {data} = await axios.get(`${siteUrl}/users/leaderboard`, {
    headers: {
      authToken
    }
  });
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
