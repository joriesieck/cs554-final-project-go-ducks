const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;

const exportedMethods = {
  async getUserByName(username) {
    const userCollection = await users();
    const user = await userCollection.findOne({ username: username });
    if (!user) throw `User with username ${username} not found`;
    return user;
  },
  async addUser(username, email, optedForLeaderboard) {
    const userCollection = await users();
    const insertInfo = await userCollection.insertOne({
      _id: 10,
      username: username,
      email: email,
      high_scores: [],
      friends: [],
      pending_friends: [],
      optedForLeaderboard: optedForLeaderboard,
    });
    return insertInfo;
  },
};
module.exports = exportedMethods;
