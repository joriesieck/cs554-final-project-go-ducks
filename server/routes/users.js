const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = require('../data/dummy_users');  // change to data.users when db funcs are done
const { checkString, checkBool } = require('../inputChecks');

// get user
router.get('/:username', async (req, res) => {
  // get the username from req.params
  let username = req.params.username;
  // make sure it's a string, nonempty, etc
  try {
    let check = checkString(username, 'Username', false);
    if (check.error) throw check.error;
    username = check.result;
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
    let check = checkString(username, 'Username', false);
    if (check.error) throw check.error;
    username = check.result;
    check = checkString(email, 'Email', false);
    if (check.error) throw check.error;
    email = check.result;
    check = checkBool(optedForLeaderboard, 'optedForLeaderboard');
    if (check.error) throw check.error;
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
    res.status(500).json({ error: e });
    return;
  }

  // send the new user to the front end
  res.status(201).json(user);
})

module.exports = router;
