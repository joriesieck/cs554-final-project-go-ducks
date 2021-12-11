const { ObjectId } = require("mongodb");

module.exports = {
	async getUserByName(username) {
		return {
			username,
			email: 'test@email.com',
			friendIDS: [],
			optedForLeaderboard,
			highScores: []
		}
	},
	async addUser(username, email, optedForLeaderboard) {
		return {
			id: new ObjectId(),
			username,
			email,
			friendIDS: [],
			optedForLeaderboard,
			highScores: []
		}
	},
	async removeUser(username) {
		return {success: true};
	},
	async addFriend(username, friendToAdd) {
		return {username, friends:[friendToAdd]}
	},
	async removeFriend(username, friendToRemove) {
		return {username, friends:[]}
	},
	async addHighScore(username, highScore) {
		return {username, highScores:[highScore]}
	}
}