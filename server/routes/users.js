const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users;
const friendData = data.friends;
const leaderboardData = data.leaderboard;
const categoryData = data.categories;
const {
  checkString,
  checkBool,
  checkObjId,
  checkNum,
  checkEmail,
  checkArray
} = require('../inputChecks');
const bluebird = require('bluebird');
const redis = require('redis');
const client = redis.createClient();

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
// get user

router.get("/", async (req, res) => {
  let allUsers;
  try {
    allUsers = await userData.getAllUsers();
    if (!allUsers) throw "there are no users"
  } catch (e) {
    res.status(404).json({ error: e.message || e.toString() });
    return;
  }
  res.json(allUsers);
})

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
    // remove user from friend and pending arrays, must remove in redis as well
    const [ friendList, pendingList ] = await userData.removeFriendAll(username);
    // unsure how to deal with the loop of asyncs
    for (let friend of friendList){
      let fstr = await client.hgetAsync('idCache', friend.toString());
      let f = JSON.parse(fstr);
      f.friends = f.friends.filter(e => e !== user._id.toString());
      await client.hsetAsync('idCache', friend.toString(), JSON.stringify(f));
    }
    for (let pending of pendingList){
      let pstr = await client.hgetAsync('idCache', pending.pendingId.toString());
      let p = JSON.parse(pstr);
      p.pending_friends = p.pending_friends.filter(e => e.pendingId !== user._id.toString());
      await client.hsetAsync('idCache', pending.pendingId.toString(), JSON.stringify(p));
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
    let [ userAdding , toAdd ] = await friendData.addFriend(username, friendToAdd);
    // update relevant users in cache
    await client.hsetAsync('idCache', userAdding._id.toString(), JSON.stringify(userAdding));
    await client.hsetAsync('idCache', toAdd._id.toString(), JSON.stringify(toAdd));
    user = userAdding;
    if (!user.username) throw 'Error adding friend.';
  } catch (e) {
    console.log(e);
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
    let [ userRemoving, toRemove] = await friendData.removeFriend(username, friendToRemove);
    // update relevant users in cache
    await client.hsetAsync('idCache', userRemoving._id.toString(), JSON.stringify(userRemoving));
    await client.hsetAsync('idCache', toRemove._id.toString(), JSON.stringify(toRemove));
    user = userRemoving;
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
    let [userAccepting, toAccept] = await friendData.acceptFriend(username, friendToAccept);
    // update relevant cached users
    await client.hsetAsync('idCache', userAccepting._id.toString(), JSON.stringify(userAccepting));
    await client.hsetAsync('idCache', toAccept._id.toString(), JSON.stringify(toAccept));
    user = userAccepting;
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
    let [userRemoving, toRemove] = await friendData.removePending(username, pendingToRemove);
    // update relevant users in cache
    await client.hsetAsync('idCache', userRemoving._id.toString(), JSON.stringify(userRemoving));
    await client.hsetAsync('idCache', toRemove._id.toString(), JSON.stringify(toRemove));
    user = userRemoving;
    if (!user.username) throw 'Error removing pending friend.';
  } catch (e) {
    res.status(400).json({ error: e });
    return;
  }

  res.status(200).json(user);
});

// save game info
router.patch('/save-game-info', async (req, res) => {
  // get the variables from req.body
  let { username, categories, highScore } = req.body;
  // check inputs
  try {
    checkString(username, 'Username', false);
    checkArray(categories, 'Categories');
    if (categories.length<=0) throw 'Please pass in at least one category.';
    for (let {categoryId, categoryName, score} of categories) {
      checkNum(categoryId, 'CategoryId');
      checkString(categoryName, 'categoryName', true);
      if (!score) score = 0;
      checkNum(score, 'Score');
    }
    checkNum(highScore, 'highScore');
  } catch (e) {
    res.status(400).json({error:`Error in saving game info: ${e}`});
    return;
  }

  // add the categories to the user
  let user;
  try {
    user = await userData.saveGameInfo(username, categories);
  } catch (e) {
    res.status(400).json({error:`Error in saving game info: ${e}`});
    return;
  }

  // add the score - throws if not the new highest score
  try {
    user = await userData.addHighScore(username, highScore);
    if (!user.username) throw 'Error adding score.';
  } catch (e) {
    if (!e.includes('not higher')) {
      res.status(400).json({ error: e });
      return;
    }
    // otherwise it's fine, no op
  }

  // add to leaderboard
  const result = await client.zadd('leaderboard', highScore, username);
  if (!result) {
    res.status(400).json({error: `Error adding ${username} to the leaderboard`});
    return;
  }

  // add to database leaderboard
  let dbResult;
  try {
    dbResult = await leaderboardData.addToLeaderboard(username, highScore);
  } catch (e) {
    res.status(400).json({error: `Error adding ${username} to the database leaderboard: ${e}`});
    return;
  }

  // add the categories to the database
  for (let {categoryId, categoryName} of categories) {
    try {
      await categoryData.addCategory(categoryId, categoryName);
    } catch (e) {
      // no op - just move on
    }
  }

  res.status(200).json(user);
});

// get leaderboard
router.get('/leaderboard', async (req, res) => {
  // get the number of people on the leaderboard
  let leaderboardCount = await client.zcardAsync('leaderboard');
  // get the number of people in the database leaderboard
  const dbLeaderboard = await leaderboardData.getLeaderboard();
  const dbLeaderboardCount = dbLeaderboard.leaderboard.length;
  // if they're different, add new people to the redis leaderboard
  if (dbLeaderboardCount>leaderboardCount) {
    for (let entry of dbLeaderboard.leaderboard) {
      if (typeof entry==='object') {
        try {
          const result = await client.zadd('leaderboard', entry.score, entry.username);
          if (!result) {
            res.status(400).json({error: `Error adding ${entry.username} to the leaderboard`});
            return;
          }
        } catch (e) {
          console.log(e);
        }
        leaderboardCount++;
      }
    }
  }

  // get the leaderboard - outputs ['FIRSTPLACE', 'SCORE', 'SECONDPLACE', 'SCORE', ...]
  const redisLeaderboard = await client.zrevrangeAsync('leaderboard', 0, leaderboardCount-1, 'WITHSCORES');
  
  // make it usable
  const leaderboard = [];
  for (let i=0;i<redisLeaderboard.length;i+=2) {
    const username = redisLeaderboard[i];
    const score = redisLeaderboard[i+1];
    try {
      const user = await userData.getUserByName(username);
      leaderboard.push({
        username,
        score,
        _id: user._id
      });
    } catch (e) {
      // just skip this one
    }
  }
  
  res.status(200).json({leaderboard});
});

// get all categories any user has practiced
router.get('/categories', async (req, res) => {
  let result;
  try {
    result = await categoryData.getAllCategories();
  } catch (e) {
    res.status(400).json({error: `Error getting categories: ${e}`});
    return;
  }
  res.status(200).json({categories:result});
})

module.exports = router;
