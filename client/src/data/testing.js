const data = require('../data');
const userData = data.users;

const getUser = async () => {
  const user = await userData.getUserByName('test');
  console.log(user);
};
const addUser = async () => {
  const name = 'Elias';
  const addUserToDatabase = await userData.addUser(name);
  console.log(addUserToDatabase);
};
getUser();
addUser();
