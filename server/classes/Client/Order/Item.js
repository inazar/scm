// module:
//		server/classes/Client/Order/Item
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
	//		Item database object
	var ItemSchema = new Schema({
		order: { type: ObjectId, ref: 'order' },		// parent order
		code: { type: String },							// client's product code
		product: { type: ObjectId, ref: 'product' },	// matched product
		status: { type: String }						// status of the item
	});

	var Item = mongo.model('item', ItemSchema);
	return Item;
});

