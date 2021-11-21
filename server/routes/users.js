const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users;

// get user
router.get('/:username', async (req, res) => {
  // get the username from req.params
  let username = req.params.username;
  // make sure it's a string, nonempty, etc
  try {
    if (!username) throw 'Please provide a username.';
    if (typeof username!=='string') throw 'Username must be a string.';
    username = username.trim();
    if (username==='') throw 'Username must contain at least one character.';
    if (username.match(/[   ]/)) throw 'Username cannot contain any whitespace characters';
  } catch (e) {
    res.status(400).json({ error: e });
    return;
  }

  // get the user
  let user;
  try {
    user = await userData.getUserByName(username);
    if (!user.name) throw 'No user found.';
  } catch (e) {
    res.status(404).json({ error: e.message || e.toString() });
    return;
  }

  // send back to front end
  res.json(user);
});

// create user - TODO once that fn is finished

module.exports = router;
