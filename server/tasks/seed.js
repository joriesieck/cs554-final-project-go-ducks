const { users, friends } = require('../data/index');

const main = async () => {
	// create some users
	let user1, user2, user3, user4, user5, user6, user7, user8;
	try {
		user1 = await users.addUser('user1', 'user1@gmail.com', true);
		console.log(user1);
	} catch (e) {
		console.log(e);
	}
	try {
		user2 = await users.addUser('user2', 'user2@gmail.com', false);
		console.log(user2);
	} catch (e) {
		console.log(e);
	}
	try {
		user3 = await users.addUser('user3', 'user3@yahoo.com', true);
		console.log(user3);
	} catch (e) {
		console.log(e);
	}
	try {
		user4 = await users.addUser('user4', 'user4@gmail.com', true);
		console.log(user4);
	} catch (e) {
		console.log(e);
	}
	try {
		user5 = await users.addUser('user5', 'user5@gmail.com', false);
		console.log(user5);
	} catch (e) {
		console.log(e);
	}
	try {
		user6 = await users.addUser('user6', 'user6@yahoo.com', true);
		console.log(user6);
	} catch (e) {
		console.log(e);
	}
	try {
		user7 = await users.addUser('user7', 'user@7aol.com', false);
		console.log(user7);
	} catch (e) {
		console.log(e);
	}
	try {
		user8 = await users.addUser('user8', 'user8@gmail.com', true);
		console.log(user8);
	} catch (e) {
		console.log(e);
	}
	try {
		await friends.addFriend('user4', "user5");
	} catch(e){
		console.log(e);
	}
	try {
		await friends.addFriend('user4', 'user6');
	} catch(e){
		console.log(e);
	}
	try {
		await friends.addFriend('user5', 'user4');
	} catch(e){
		console.log(e);
	}
	try {
		await friends.addFriend('user8', 'user5');
	} catch(e){
		console.log(e);
	}
	try {
		await friends.addFriend('user5', 'user7');
	} catch(e){
		console.log(e);
	}
	try {
		await friends.acceptFriend('user6', 'user4');
	} catch(e){
		console.log(e);
	}
	try {
		await friends.addFriend('user5', 'user6');
	} catch(e){
		console.log(e);
	}
	try {
		await friends.acceptFriend('user6', 'user5')
	} catch (e) {
		console.log(e);
	}
	// for testing
	// try {
	// 	await users.removeUser('user5')
	// } catch(e) {
	// 	console.log(e);
	// }
	// removals, can get rid of
	// try {
	// 	let res = await friends.removeFriend('user4', 'user6');
	// 	console.log(res);
	// } catch(e){
	// 	console.log(e)
	// }
	// try {
	// 	let res = await friends.removePending('user5', 'user6');
	// 	console.log(res);
	// } catch(e){
	// 	console.log(e)
	// }
}

main();
