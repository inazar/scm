// module:
//		server/classes/Product/Image
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
	//		Image database object
	var ImageSchema = new Schema({
		title: { type: String },
		data: { type: Buffer }
	});

	var Image = mongo.model('image', ImageSchema);
	return Image;
});

