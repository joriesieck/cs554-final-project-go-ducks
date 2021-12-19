const { ObjectId } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const {
  checkString,
  checkObjId,
  checkBool,
  checkEmail,
  checkNum,
  checkArray,
} = require('../inputChecks');
const users = mongoCollections.users;

const exportedMethods = {
  async getAllUsers() {
    const userCollection = await users();

    const allUsers = await userCollection.find({}).toArray();

    if (!allUsers) throw 'There are no users';
    return allUsers;
  },
  async getUserById(id) {
    checkObjId(id, 'User ID');
    const parsedId = ObjectId(id);
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: parsedId });
    if (!user) throw `User with ID ${id} not found`;
    return user;
  },
  async getUserByName(username) {
    checkString(username, 'Username', false);
    const userCollection = await users();
    const user = await userCollection.findOne({ username: username });
    if (!user) throw `User with username ${username} not found`;
    return user;
  },
  async getUserByEmail(email) {
    checkEmail(email, 'Email');
    const userCollection = await users();
    const user = await userCollection.findOne({ email: email });
    if (!user) throw `User with email ${email} not found`;
    return user;
  },
  async searchUsersByName(searchString){
    let search = checkString(searchString, 'Search String', false);
    let validStr = search.replace(/[^a-z\d]/gi, "");
    if (!validStr){
      throw "Search string not valid";
    }
    let userCollection = await users();
    let results = await userCollection.find(
        {username: { $regex: ".*" + validStr + ".*", $options: "i"}}
    )
    results = results.toArray()
    return results;
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
      recent_categories: [],
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
    const updatedUser = await this.getUserByEmail(email ?? originalEmail);
    return updatedUser;
  },
  async removeUser(username) {
    checkString(username, 'Username', false);
    const userCollection = await users();
    const userByUsername = await userCollection.findOne({ username: username });
    if (!userByUsername) throw `User with username ${username} doesn't exist`;
    //await removeFriendAll(username);

    return await userCollection.deleteOne({ username: username });
  },
  async removeFriendAll(friendName) {
    checkString(friendName, 'Friend Name', false);
    let friend = await exportedMethods.getUserByName(friendName);
    // if no friends, skip pull from friends; if no pending, skip pull from pending
    const userCollection = await users();
    if (friend.friends.length > 0) {
      const updateFriends = await userCollection.updateMany(
        { friends: friend._id },
        { $pull: { friends: friend._id } }
      );
      if (!updateFriends.matchedCount && !updateFriends.modifiedCount) {
        throw `Unable to remove User ${friendName} from friends of users`;
      }
    }
    if (friend.pending_friends.length > 0) {
      const updatePending = await userCollection.updateMany(
        { 'pending_friends.pendingId': friend._id },
        { $pull: { pending_friends: { pendingId: friend._id } } }
      );
      if (!updatePending.matchedCount && !updatePending.modifiedCount) {
        throw `Unable to remove User ${friendName} from friends of users`;
      }
    }
    return [friend.friends, friend.pending_friends];
  },
  async saveGameInfo(username, categories) {
    checkString(username, 'Username', false);
    checkArray(categories, 'Categories');
    if (categories.length <= 0) throw 'Please pass in at least one category.';
    for (let { categoryId, categoryName, score } of categories) {
      checkNum(categoryId, 'CategoryId');
      checkString(categoryName, 'categoryName', true);
      if (!score) score = 0;
      checkNum(score, 'Score');
    }
    const userCollection = await users();
    const user = await userCollection.findOne({ username });

    // create the field if this is an old user that doesn't have it
    if (!user.recent_categories) user.recent_categories = [];

    // loop over categories
    for (let { categoryId, categoryName, score } of categories) {
      // if we've seen this before, remove the old category to preserve shifting order
      user.recent_categories = user.recent_categories.filter(
        (cat) => cat.categoryId !== categoryId
      );
      user.recent_categories.push({ categoryId, categoryName, score: score || 0 });
    }
    // only keep at most 12 categories (2 games' worth)
    while (user.recent_categories.length > 12) user.recent_categories.shift();

    const result = await userCollection.updateOne(
      { username },
      { $set: { recent_categories: user.recent_categories } }
    );
    if (!result.acknowledged) throw `Error updating user ${username}`;
    const updatedUser = await userCollection.findOne({ username });
    return updatedUser;
  },
  async addHighScore(user, highScore) {
    const { username } = user;
    checkString(username, 'Username', false);
    checkNum(highScore, 'HighScore');
    const userCollection = await users();

    // make sure this is really a high score
    if (user.high_scores.length > 0 && Math.max(user.high_scores) >= highScore)
      throw 'This score is not higher than all previous scores.';

    user.high_scores.push(highScore);
    const result = await userCollection.updateOne(
      { username },
      { $set: { high_scores: user.high_scores } }
    );
    if (!result.modifiedCount) throw `Error updating user ${username}`;
    const updatedUser = await userCollection.findOne({ username });
    return updatedUser;
  },
  async getHighScore(user) {
    const highScore = Math.max(...user.high_scores);
    checkNum(highScore, 'high score');
    return highScore;
  },
};

module.exports = exportedMethods;
