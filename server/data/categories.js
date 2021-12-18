const mongoCollections = require('../config/mongoCollections');
const categories = mongoCollections.categories;
const {checkNum, checkString} = require('../inputChecks');

const exportedMethods = {
	async addCategory (categoryId, categoryName) {
		// input checks
		checkNum(categoryId, 'CategoryId');
		checkString(categoryName, 'CategoryName', true);

		// get the collection
		const categoryCollection = await categories();
		// make sure we haven't seen this category before
		const findRes = await categoryCollection.findOne({categoryId});
		if (findRes) throw `Error adding category ${categoryId}: category exists`;

		// add the category
		const result = await categoryCollection.insertOne({
			categoryId,
			categoryName
		});
		if (!result.insertedId) throw `Error adding category ${categoryId}`;

		return result;
	},
	async getAllCategories () {
		const categoryCollection = await categories();
		const allCategories = await categoryCollection.find().toArray();
		return allCategories;
	}
};

module.exports = exportedMethods;