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
			username,
			email,
			friendIDS: [],
			optedForLeaderboard,
			highScores: []
		}
	}
}