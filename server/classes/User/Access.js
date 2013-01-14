// module:
//		server/classes/User/Access
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
	//		Object access schema
	var ObjectSchema = {
		"get": { type: Boolean, "default": false },
		"put": { type: Boolean, "default": false },
		"post": { type: Boolean, "default": false },
		"delete": { type: Boolean, "default": false }
	};

	// summary:
	//		Access database object
	var AccessSchema = new Schema({
		client: { type: ObjectId, ref: 'client' },
		user: { type: ObjectId, ref: 'user' },
		access: {
			product: ObjectSchema,
			order: ObjectSchema,
			supply: ObjectSchema
		}
	});

	var Access = mongo.model('acces', AccessSchema);
	return Access;
});

