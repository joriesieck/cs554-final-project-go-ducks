const MongoClient = require('mongodb').MongoClient;
require('dotenv').config({ path: '../.env' });
console.log(process.env.DB_URL);
const settings = {
  mongoConfig: {
    serverUrl: process.env.DB_URL,
    database: process.env.DB_NAME,
  },
};
const mongoConfig = settings.mongoConfig;
let _connection = undefined;
let _db = undefined;

module.exports = async () => {
  if (!_connection) {
    _connection = await MongoClient.connect(mongoConfig.serverUrl, {
      useNewUrlParser: true,
    });
    _db = await _connection.db(mongoConfig.database);
  }

  return _db;
};
