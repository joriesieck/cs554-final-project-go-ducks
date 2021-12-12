const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users; // change to data.users when db funcs are done
const {
  checkString,
  checkBool,
  checkObjId,
  checkNum,
  checkEmail,
} = require('../inputChecks');

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
    user = await userData.getUserByName(username);
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
    user = await userData.getUserByEmail(email);
    if (!user.username) throw 'No user found.';
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
      updatedUser = await userData.updateUser(originalEmail, updatedFields);
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
    await userData.removeUser(username);
  } catch (e) {
    res.status(400).json({ error: e });
    return;
  }
  // return success
  res.status(200).json({ message: `${username} successfully deleted` });
});

// add friend
router.patch('/add-friend', async (req, res) => {
  // get the variables from req.body
  let { username, friendToAdd } = req.body;
  // make sure it's a string, nonempty, etc
  try {
    username = checkString(username, 'Username', false);
    checkObjId(friendToAdd, 'friendToAdd');
  } catch (e) {
    res.status(400).json({ error: e });
    return;
  }

  // add the friend
  let user;
  try {
    user = await userData.addFriend(username, friendToAdd);
    if (!user.username) throw 'Error adding friend.';
  } catch (e) {
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
    checkObjId(friendToRemove, 'friendToRemove');
  } catch (e) {
    res.status(400).json({ error: e });
    return;
  }

  // remove the friend
  let user;
  try {
    user = await userData.removeFriend(username, friendToRemove);
    if (!user.username) throw 'Error removing friend.';
  } catch (e) {
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
