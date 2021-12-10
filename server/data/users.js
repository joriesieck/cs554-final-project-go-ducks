const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;

const exportedMethods = {
  async getUserByName(username) {
    const userCollection = await users();
    const user = await userCollection.findOne({ username: username });
    if (!user) throw `User with username ${username} not found`;
    return user;
  },
  async getUserByEmail(email) {
    const userCollection = await users();
    const user = await userCollection.findOne({ email: email });
    if (!user) throw `User with email ${email} not found`;
    return user;
  },
  async doesUserExist(username, email) {
    const userCollection = await users();
    const userByUsername = await userCollection.findOne({ username: username });
    if (userByUsername) throw `User with username ${username} already exists`;
    const userByEmail = await userCollection.findOne({ email: email });
    if (userByEmail) throw `User with email ${email} already exists`;
  },
  async addUser(username, email, optedForLeaderboard) {
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
};
module.exports = exportedMethods;
