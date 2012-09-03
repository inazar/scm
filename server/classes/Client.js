// module:
//		server/classes/Client
define([
	"../node/mongo",
	"../node/mongoose!Schema",
	"../node/mongoose!ObjectId"
], function (mongo, Schema, ObjectId) {

	// summary:
	//		Client database object
	var ClientSchema = new Schema({
		name: { type: String, unique: true },
		secret: { type: String, select: false },
		redirect_uri: String
	});

	ClientSchema.statics.checkSecret = function (name, secret, callback) {
		// summary:
		//		Verify client secret
		// name: String
		//		client name
		// secret: String
		//		Client secret
		// callback: Function
		//		Callback receives Error object or null and Boolean as arguments
		if (!callback) return;
		Client.findOne({name: name}, '+secret', function (err, client) {
			if (err) return callback(err);
			if (!client) return callback(null, false);
			callback(null, client.secret === secret);
		});
	};

	var Client = mongo.model('client', ClientSchema);
	return Client;
});
