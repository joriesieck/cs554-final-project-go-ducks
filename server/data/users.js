const { ObjectId } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const { checkString, checkObjId, checkBool, checkEmail } = require('../inputChecks');
const users = mongoCollections.users;

const exportedMethods = {
  async getUserById(id){
    checkObjId(id, "User ID");
    const parsedId = ObjectId(id);
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: parsedId});
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
    return await this.getUserByEmail(email ?? originalEmail);
  },
};
module.exports = exportedMethods;
