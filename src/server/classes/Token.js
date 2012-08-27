// module:
//		server/classes/Token
define([
	"../node/mongo",
	"../node/mongoose!Schema",
	"../node/mongoose!ObjectId"
], function (mongo, Schema, ObjectId) {

	// summary:
	//		Token database object
	var TokenSchema = new Schema({
		token: { type: String, unique: true },
		user: { type: ObjectId, ref: 'user' },
		client: { type: ObjectId, ref: 'client' }
	});

	TokenSchema.statics.checkScope = function (token, callback) {
		// summary:
		//		Get scope related to the token
		// tken: String
		//		Access token
		// callback: Function
		//		Callback receives Error object or null, false if no token found or
		//		null, User object, scope object as arguments
		if (!callback) return;
		Token.findOne({ token: token }).populate('user').exec(function(err, token) {
			if (err) return callback(err);
			if (!token || !token.user) return callback(null, false);
			callback(null, token.user, { scope: '*' }); // TODO: implement restricted scopes
		});
	};

	TokenSchema.methods.toString = function() { return this.token; };

	var Token = mongo.model('token', TokenSchema);
	return Token;
});
