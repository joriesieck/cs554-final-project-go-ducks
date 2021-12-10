const { users } = require('../data/index');

const main = async () => {
	// create some users
	let user1, user2, user3;
	try {
		user1 = await users.addUser('user1');
		console.log(user1);
	} catch (e) {
		console.log(e);
	}
	try {
		user2 = await users.addUser('user2');
		console.log(user2);
	} catch (e) {
		console.log(e);
	}
	try {
		user3 = await users.addUser('user3');
		console.log(user3);
	} catch (e) {
		console.log(e);
	}
}

main();
