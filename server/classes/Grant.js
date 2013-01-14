// module:
//		server/classes/Grant
define([
	"server/node/mongo",
	"server/node/mongoose!Schema",
	"server/node/mongoose!ObjectId"
], function (mongo, Schema, ObjectId) {

	// summary:
	//		Grant database object
	var GrantSchema = new Schema({
		code: { type: String, unique: true },
		user: { type: ObjectId, ref: 'user' },
		client: { type: ObjectId, ref: 'client' },
		uri: { type: String }
	});

	GrantSchema.methods.toString = function() { return this.code; };

	var Grant = mongo.model('grant', GrantSchema);
	return Grant;
});
