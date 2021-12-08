const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = require('../data/dummy_users');  // change to data.users when db funcs are done
const { checkString, checkBool, checkObjId } = require('../inputChecks');

// get user
router.get('/:username', async (req, res) => {
  // get the username from req.params
  let username = req.params.username;
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

// create user
router.post('/', async (req, res) => {
  // get variables from req body
  let {username, email, optedForLeaderboard} = req.body;
  // make sure exists, type, etc
  try {
    username = checkString(username, 'Username', false);
    email = checkString(email, 'Email', false);
    checkBool(optedForLeaderboard, 'optedForLeaderboard');
  } catch (e) {
    res.status(400).json({ error: e });
    return;
  }

  // create the user
  let user;
  try {
    user = await userData.addUser(username, email, optedForLeaderboard);
    if (!user.username) throw 'Sorry, something went wrong creating the user.';
  } catch (e) {
    res.status(400).json({ error: e });
    return;
  }

  // send the new user to the front end
  res.status(201).json(user);
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
  let result;
  try {
    result = await userData.removeUser(username);
    if (!result.success) throw 'Error deleting user.';
  } catch (e) {
    res.status(400).json({ error: e });
    return;
  }

  // return success
  res.status(200).json({message: `${username} successfully deleted`});
});

// add friend
router.patch('/add-friend', async (req, res) => {
  // get the variables from req.body
  let {username, friendToAdd} = req.body;
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

  return user;
});

// remove friend
router.patch('/remove-friend', async (req, res) => {
  // get the variables from req.body
  let {username, friendToRemove} = req.body;
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

  return user;
});

// add high score
router.patch('/add-highscore', async (req, res) => {
  // get the variables from req.body
  let {username, highScore} = req.body;
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

  return user;
});

module.exports = router;
