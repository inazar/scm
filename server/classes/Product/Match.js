// module:
//		server/classes/Product/Match
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
	//		Match database object
	// description:
	//		The database of matches between customer product codes and vendor product codes. Matches
	//		are collected over the time and sooner or later will cover all products
	var MatchSchema = new Schema({
		client: { type: ObjectId, ref: 'client' },		// client for which match is created
		code: { type: String, required: true },			// client's code
		product: { type: ObjectId, ref: 'product' }		// actual product
	});

	var Match = mongo.model('match', MatchSchema);
	return Match;
});

