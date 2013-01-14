// module:
//		server/classes/Product/Category
define([
	"server/node/mongo",
	"server/node/mongoose!Schema",
	"server/node/mongoose!ObjectId",
	"server/config/env",
	"dojo/Deferred",
	"dojo/when",
	"dojo/promise/all",
	"server/auth/access",
	"server/node/error"
], function (mongo, Schema, ObjectId, env, Deferred, when, all, access, error) {

	// summary:
	//		Category database object
	var CategorySchema = new Schema({
		name: { type: String },					// category name
		description: { type: String },			// category description
		keys: [{ type: String }],				// array of keys used for product properties
		lead: { type: Number, "default": 0 }	// generic lead time - used as initial value for products
	});

	var Category = mongo.model('category', CategorySchema);
	return Category;
});

