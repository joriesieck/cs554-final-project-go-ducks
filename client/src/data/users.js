const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;

const exportedMethods = {
  async getUserByName(username) {
    const userCollection = await users();
    const user = await userCollection.findOne({ name: username });
    if (!user) throw `User with username ${username} not found`;
    return user;
  },
  async addUser(name) {
    const userCollection = await users();
    const insertInfo = await userCollection.insertOne({ name: name });
    return insertInfo;
  },
};
module.exports = exportedMethods;
