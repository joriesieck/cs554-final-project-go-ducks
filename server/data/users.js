const { ObjectId } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const {
  checkString,
  checkObjId,
  checkBool,
  checkEmail,
} = require('../inputChecks');
const users = mongoCollections.users;
const bluebird = require('bluebird');
const redis = require('redis');
const client = redis.createClient();

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

async function removeFriendAll(friendName) {
  checkString(friendName, 'Friend Name', false);
  const userCollection = await users();
  const updateFriends = await userCollection.updateMany(
    { friends: friendName },
    { $pull: { friends: friendName } }
  );
  if (!updateFriends.matchedCount && !updateFriends.modifiedCount) {
    throw `Unable to remove User ${friendName} from friends of users`;
  }
  const updatePending = await userCollection.updateMany(
    { 'pending_friends.pendingName': friendName },
    { $pull: { pending_friends: { pendingName: friendName } } }
  );
  if (!updatePending.matchedCount && !updatePending.modifiedCount) {
    throw `Unable to remove User ${friendName} from friends of users`;
  }
  return true;
}

const exportedMethods = {
  async getUserById(id) {
    checkObjId(id, 'User ID');
    const cachedUser = await client.hgetAsync('idCache', id);
    if (cachedUser) {
      return JSON.parse(cachedUser);
    } else {
      const parsedId = ObjectId(id);
      const userCollection = await users();
      const user = await userCollection.findOne({ _id: parsedId });
      if (!user) throw `User with ID ${id} not found`;
      await client.hmsetAsync('idCache', id, JSON.stringify(user));
      return user;
    }
  },
  async getUserByName(username) {
    checkString(username, 'Username', false);
    const cachedUserID = await client.hgetAsync('usernameCache', username); //returns an ID
    if (cachedUserID) {
      const cachedUser = await client.hgetAsync('idCache', cachedUserID); //returns all information
      return JSON.parse(cachedUser);
    } else {
      const userCollection = await users();
      const user = await userCollection.findOne({ username: username });
      if (!user) throw `User with username ${username} not found`;
      await client.hmsetAsync('usernameCache', username, user._id.toString());
      await client.hmsetAsync(
        'idCache',
        user._id.toString(),
        JSON.stringify(user)
      );
      return user;
    }
  },
  async getUserByEmail(email) {
    checkEmail(email, 'Email');
    const cachedUserID = await client.hgetAsync('emailCache', email); //returns an ID
    if (cachedUserID) {
      const cachedUser = await client.hgetAsync('idCache', cachedUserID); //returns all information
      return JSON.parse(cachedUser);
    } else {
      const userCollection = await users();
      const user = await userCollection.findOne({ email: email });
      if (!user) throw `User with email ${email} not found`;
      await client.hmsetAsync('emailCache', email, user._id.toString());
      await client.hmsetAsync(
        'idCache',
        user._id.toString(),
        JSON.stringify(user)
      );

      return user;
    }
  },
  async doesUserExist(username, email) {
    checkString(username, 'Username', false);
    checkEmail(email, 'Email');
    const userCollection = await users();
    const userByUsername = await userCollection.findOne({ username: username });
    if (userByUsername) throw `User with username ${username} already exists`;
    const userByEmail = await userCollection.findOne({ email: email });
    if (userByEmail) throw `User with email ${email} already exists`;
  },
  async addUser(username, email, optedForLeaderboard) {
    checkString(username, 'Username', false);
    checkEmail(email, 'Email');
    checkBool(optedForLeaderboard, 'optedForLeaderboard');
    await this.doesUserExist(username, email);
    const userCollection = await users();
    const insertInfo = await userCollection.insertOne({
      username: username,
      email: email,
      high_scores: [],
      friends: [],
      pending_friends: [],
      optedForLeaderboard: optedForLeaderboard,
    });
    return insertInfo;
  },
  async updateUser(originalEmail, updatedFields) {
    const { username, email, optedForLeaderboard } = updatedFields;
    const userCollection = await users();
    if (username !== undefined) {
      //If new username is supplied, check its valid and does not exist elsewhere
      checkString(username, 'Username', false);
      const userByUsername = await userCollection.findOne({
        username: username,
      });
      if (userByUsername) throw `User with username ${username} already exists`;
    }
    if (email !== undefined) {
      //If new email is supplied, check its valid and does not exist elsewhere
      checkEmail(email, 'Email');
      const userByEmail = await userCollection.findOne({ email: email });
      if (userByEmail) throw `User with email ${email} already exists`;
    }
    if (optedForLeaderboard !== undefined) {
      checkBool(optedForLeaderboard, 'optedForLeaderboard');
    }
    await userCollection.updateOne(
      { email: originalEmail },
      { $set: updatedFields }
    );
    await client.hdelAsync('emailCache', originalEmail); //If the user is stored in the cache, we need to make sure we dont get the old version from cache
    const updatedUser = await this.getUserByEmail(email ?? originalEmail);

    //updates or sets usernameCache with the current username value
    await client.hmsetAsync(
      'usernameCache',
      updatedUser.username,
      updatedUser._id.toString()
    );
    // if the user was cached, the cache with update with new values, otherwise it will just be added to the cache
    await client.hmsetAsync(
      'idCache',
      updatedUser._id.toString(),
      JSON.stringify(updatedUser)
    );
    return updatedUser;
  },
  async removeUser(username) {
    checkString(username, 'Username', false);
    const userCollection = await users();
    const userByUsername = await userCollection.findOne({ username: username });
    if (!userByUsername) throw `User with username ${username} doesn't exist`;
    await removeFriendAll(username);
    await client.hdelAsync('idCache', userByUsername._id.toString());
    await client.hdelAsync('usernameCache', userByUsername.username.toString());
    await client.hdelAsync('emailCache', userByUsername.email.toString());
    return await userCollection.deleteOne({ username: username });
  },
};
module.exports = exportedMethods;
