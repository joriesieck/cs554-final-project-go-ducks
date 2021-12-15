const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users; // change to data.users when db funcs are done
const friendData = data.friends;
const {
  checkString,
  checkBool,
  checkObjId,
  checkNum,
  checkEmail,
} = require('../inputChecks');
const bluebird = require('bluebird');
const redis = require('redis');
const client = redis.createClient();

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
// get user
router.get('/username/:username', async (req, res) => {
  // get the username from req.params
  let { username } = req.params;
  // make sure it's a string, nonempty, etc
  try {
    username = checkString(username, 'Username', false);
  } catch (e) {
    res.status(400).json({ error: e });
    return;
  }

  // get the user
  let user;
  try {
    const cachedUserID = await client.hgetAsync('usernameCache', username); //returns an ID
    if (cachedUserID) {
      const cachedUser = await client.hgetAsync('idCache', cachedUserID); //returns all information
      user = JSON.parse(cachedUser);
    } else {
      user = await userData.getUserByName(username);
      await client.hmsetAsync('usernameCache', username, user._id.toString());
      await client.hmsetAsync(
        'idCache',
        user._id.toString(),
        JSON.stringify(user)
      );
      if (!user.username) throw 'No user found.';
    }
  } catch (e) {
    res.status(404).json({ error: e.message || e.toString() });
    return;
  }

  // send back to front end
  res.json(user);
});
// get user by id
router.get('/id/:id', async (req, res) => {
  // get the username from req.params
  let { id } = req.params;
  // make sure it's a string, nonempty, etc
  try {
    checkObjId(id, 'User ID');
  } catch (e) {
    res.status(400).json({ error: e });
    return;
  }

  // get the user
  let user;
  try {
    user = await userData.getUserById(id);
    if (!user.username) throw 'No user found.';
  } catch (e) {
    res.status(404).json({ error: e.message || e.toString() });
    return;
  }

  // send back to front end
  res.json(user);
});
router.get('/email/:email', async (req, res) => {
  // get the email from req.params
  let { email } = req.params;
  // make sure it's a string, nonempty, etc
  try {
    email = checkEmail(email, 'Email');
  } catch (e) {
    res.status(400).json({ error: e });
    return;
  }

  // get the user
  let user;
  try {
    const cachedUserID = await client.hgetAsync('emailCache', email); //returns an ID
    if (cachedUserID) {
      const cachedUser = await client.hgetAsync('idCache', cachedUserID); //returns all information
      user = JSON.parse(cachedUser);
    } else {
      user = await userData.getUserByEmail(email);
      await client.hmsetAsync('emailCache', email, user._id.toString());
      await client.hmsetAsync(
        'idCache',
        user._id.toString(),
        JSON.stringify(user)
      );
      if (!user.username) throw 'No user found.';
    }
  } catch (e) {
    res.status(404).json({ error: e.message || e.toString() });
    return;
  }

  // send back to front end
  res.json(user);
});
// create user
router.post('/', async (req, res) => {
  // get variables from req body
  let { username, email, optedForLeaderboard } = req.body;
  // make sure exists, type, etc
  try {
    username = checkString(username, 'Username', false);
    email = checkEmail(email, 'Email');
    checkBool(optedForLeaderboard, 'optedForLeaderboard');
  } catch (e) {
    res.status(400).json({ error: e });
    return;
  }

  // create the user
  let user;
  try {
    user = await userData.addUser(username, email, optedForLeaderboard);
  } catch (e) {
    res.status(400).json({ error: `Could not create user. Error: ${e}` });
    return;
  }

  // send the new user to the front end
  res.status(201).json(user);
});
router.patch('/edit-user', async (req, res) => {
  let { originalEmail, username, newEmail, optedForLeaderboard } = req.body;
  //originalEmail will be used to find the user we are updating
  let updatedFields = {};
  try {
    const user = await userData.getUserByEmail(originalEmail);
    if (username !== undefined && username !== user.username) {
      username = checkString(username, 'Username', false);
      updatedFields.username = username;
    }
    if (newEmail !== undefined && newEmail !== user.email) {
      email = checkEmail(newEmail, 'newEmail');
      updatedFields.email = email;
    }
    if (
      optedForLeaderboard !== undefined &&
      optedForLeaderboard !== user.optedForLeaderboard
    ) {
      checkBool(optedForLeaderboard, 'optedForLeaderboard');
      updatedFields.optedForLeaderboard = optedForLeaderboard;
    }
  } catch (e) {
    res.status(400).json({ error: `Error in request: ${e}` });
    return;
  }
  if (Object.keys(updatedFields).length === 0) {
    //No fields updated
    res.status(400).json({ error: 'Minimum of one field must be updated' });
  } else {
    try {
      const updatedUser = await userData.updateUser(
        originalEmail,
        updatedFields
      );
      await client.hdelAsync('emailCache', originalEmail); //delete old user info from cache
      await client.hmsetAsync(
        //add new user info to cache
        'emailCache',
        updatedUser.email,
        updatedUser._id.toString()
      );
      await client.hmsetAsync(
        'idCache',
        updatedUser._id.toString(),
        JSON.stringify(updatedUser)
      );
      res.status(201).json(updatedUser);
    } catch (e) {
      res.status(400).json({ error: `Could not update user. Error: ${e}` });
    }
  }
});
// remove user
router.delete('/:username', async (req, res) => {
  // get the username from req.params
  let username = req.params.username;
  // make sure it's a string, nonempty, etc
  try {
    username = checkString(username, 'Username', false);
  } catch (e) {
    res.status(400).json({ error: e });
    return;
  }
  // delete the user
  try {
    let user;
    const cachedUserID = await client.hgetAsync('usernameCache', username); //returns an ID
    if (cachedUserID) {
      const cachedUser = await client.hgetAsync('idCache', cachedUserID); //returns all information
      user = JSON.parse(cachedUser);
    } else {
      user = await userData.getUserByName(username);
    }
    await userData.removeUser(username);
    //Remvoe user from wherever it may be in the cache
    await client.hdelAsync('idCache', user._id.toString());
    await client.hdelAsync('usernameCache', user.username.toString());
    await client.hdelAsync('emailCache', user.email.toString());
  } catch (e) {
    res.status(400).json({ error: `Could not delete user. Error: ${e}` });
    return;
  }
  // return success
  res.status(200).json({ message: `${username} successfully deleted` });
});

// get friends of user
router.get('/friends/:username', async (req, res) => {
  // get username from req.params
  let { username } = req.params;
  // make sure it's a string, nonempty, etc
  try {
    username = checkString(username, 'Username', false);
  } catch (e) {
    res.status(400).json({ error: e});
    return;
  }

  // get friends
  let friends;
  try {
    friends = await friendData.getAllFriends(username);
  } catch (e) {
    res.status(400).json({ error: e });
    return;
  }

  res.status(200).json(friends);
});

// get pending friends of user
router.get('/pending-friends/:username', async (req, res) => {
  // get username from req.params
  let { username } = req.params;
  // make sure it's a string, nonempty, etc
  try {
    username = checkString(username, 'Username', false);
  } catch (e) {
    res.status(400).json({ error: e});
    return;
  }

  // get friends
  let pendingFriends;
  try {
    pendingFriends = await friendData.getAllPending(username);
  } catch (e) {
    res.status(400).json({ error: e });
    return;
  }

  res.status(200).json(pendingFriends);
});

// add friend
router.patch('/add-friend', async (req, res) => {
  // get the variables from req.body
  let { username, friendToAdd } = req.body;
  // make sure it's a string, nonempty, etc
  try {
    username = checkString(username, 'Username', false);
    friendToAdd = checkString(friendToAdd, 'friendToAdd', false);
  } catch (e) {
    res.status(400).json({ error: e });
    return;
  }

  // add the friend
  let user;
  try {
    user = await friendData.addFriend(username, friendToAdd);
    if (!user.username) throw 'Error adding friend.';
  } catch (e) {
    console.log(e)
    res.status(400).json({ error: e });
    return;
  }

  res.status(200).json(user);
});

// remove friend
router.patch('/remove-friend', async (req, res) => {
  // get the variables from req.body
  let { username, friendToRemove } = req.body;
  // make sure it's a string, nonempty, etc
  try {
    username = checkString(username, 'Username', false);
    friendToRemove = checkString(friendToRemove, 'friendToRemove', false);
  } catch (e) {
    res.status(400).json({ error: e });
    return;
  }

  // remove the friend
  let user;
  try {
    user = await friendData.removeFriend(username, friendToRemove);
    if (!user.username) throw 'Error removing friend.';
  } catch (e) {
    res.status(400).json({ error: e });
    return;
  }

  res.status(200).json(user);
});

// accept friend
router.patch('/accept-friend', async (req, res) => {
  // get the variables from req.body
  let { username, friendToAccept } = req.body;
  // make sure it's a string, nonempty, etc
  try {
    username = checkString(username, 'Username', false);
    friendToAccept = checkString(friendToAccept, 'friendToAccept', false);
  } catch (e) {
    res.status(400).json({ error: e });
    return;
  }

  // accept the friend
  let user;
  try {
    user = await friendData.acceptFriend(username, friendToAccept);
    if (!user.username) throw 'Error accepting friend.';
  } catch (e) {
    res.status(400).json({ error: e });
    return;
  }

  res.status(200).json(user);
});

// remove pending friend
router.patch('/remove-pending-friend', async (req, res) => {
  // get the variables from req.body
  let { username, pendingToRemove } = req.body;
  // make sure it's a string, nonempty, etc
  try {
    username = checkString(username, 'Username', false);
    pendingToRemove = checkString(pendingToRemove, 'pendingToRemove', false);
  } catch (e) {
    res.status(400).json({ error: e });
    return;
  }

  // remove the pending friend
  let user;
  try {
    user = await friendData.removePending(username, pendingToRemove);
    if (!user.username) throw 'Error removing pending friend.';
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: e });
    return;
  }

  res.status(200).json(user);
});

// add high score
router.patch('/add-highscore', async (req, res) => {
  // get the variables from req.body
  let { username, highScore } = req.body;
  // make sure it's a string, nonempty, etc
  try {
    username = checkString(username, 'Username', false);
    checkNum(highScore, 'highScore');
  } catch (e) {
    res.status(400).json({ error: e });
    return;
  }

  // add the score
  let user;
  try {
    user = await userData.addHighScore(username, highScore);
    if (!user.username) throw 'Error adding score.';
  } catch (e) {
    res.status(400).json({ error: e });
    return;
  }

  res.status(200).json(user);
});

module.exports = router;
