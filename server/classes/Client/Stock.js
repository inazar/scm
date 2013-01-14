// module:
//		server/classes/Client/Stock
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
	//		Stock database object
	// description:
	//		Listing of the products available on supplier's stock. Products available on stock are available immediately,
	//		however products available from supplier are considered as available on stock at product lead time
	var StockSchema = new Schema({
		owner: { type: ObjectId, ref: 'client' }	// client (supplier) which owns the stock
	});

	var Stock = mongo.model('stock', StockSchema);
	return Stock;
});

