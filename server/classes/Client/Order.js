// module:
//		server/classes/Client/Order
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
	//		Order database object
	var OrderSchema = new Schema({
		from: { type: ObjectId, ref: 'client' },	// client which placed order
		to: { type: ObjectId, ref: 'client' },		// client which receives order
		code: { type: String, required: true },		// order number assigned when placing order
		items: [{ type: ObjectId, ref: 'item' }],	// items from the order
		status: { type: String }					// order status
	});

	var Order = mongo.model('order', OrderSchema);
	return Order;
});

