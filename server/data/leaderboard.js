const mongoCollections = require('../config/mongoCollections');
const leaderboard = mongoCollections.leaderboard;
const {
  checkString,
  checkNum
} = require('../inputChecks');

const exportedMethods = {
	async addToLeaderboard (username, score) {
		checkString(username, 'Username', false);
		checkNum(score, 'Score');
		const leaderboardCollection = await leaderboard();
		// get the current leaderboard
		const currentLeaderboard = await leaderboardCollection.findOne({tag: 'leaderboard'});
		// remove any previous entries for this person
		currentLeaderboard.leaderboard = currentLeaderboard.leaderboard.filter((entry) => entry.username!==username);
		// add the new person
		currentLeaderboard.leaderboard.push({username, score});
		// update
		const result = await leaderboardCollection.updateOne({tag: 'leaderboard'}, {$set: {leaderboard:currentLeaderboard.leaderboard}});
		if (!result.acknowledged) throw 'Error updating leaderboard';
		return result;
	},
	async getLeaderboard () {
		const leaderboardCollection = await leaderboard();
		const currentLeaderboard = await leaderboardCollection.findOne({tag: 'leaderboard'});
		return currentLeaderboard;
	}
}

module.exports = exportedMethods;