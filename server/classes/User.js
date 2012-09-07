// module:
//		server/classes/User
define([
	"../node/mongo",
	"../node/mongoose!Schema",
	"../node/mongoose!ObjectId",
	"../config/env"
], function (mongo, Schema, ObjectId, env) {

	// summary:
	//		User database object
	var UserSchema = new Schema({
		email: { type: String, index: true },   			// User's email
		name: { type: String },					 			// User's name
		confirmed: { type: Boolean },						// Weather user confirmed email
		secret: { type: String, select: false },			// Password hash
		blocked: { type: Boolean, 'default': false },		// Wheather user is blocked
		failures: { type: Number, 'default': 0 },			// Failed login attempts
		locale: { type: String },							// User's preferred locale
		clients: [{ type: ObjectId, ref: 'client' }],		// reference to customers
		client: { type: ObjectId, ref: 'client', 'default': null }	// reference to last used customer
	});

	UserSchema.statics.checkPassword = function (email, pwd, callback) {
		// summary:
		//		Verify user credentials, keep track of login failures and
		//		block user after configurable number of failures
		// email: String
		//		user's email
		// pwd: String
		//		MD5 hash on user's password
		// callback: Function
		//		Callback receives Error object or null and false or user ID as arguments
		if (!callback) return;
		User.findOne({email: email, confirmed: true}, '+secret', function(err, user) {
			if (err) return callback(err);
			if (!user) return callback(null, false, "user unknown");
			if (user.blocked) return callback(null, false, "user blocked");
			if (user.secret === pwd) {
				if (user.failures) {
					user.failures = 0;
					user.save(function (err) {
						callback (err, user);
					});
				} else callback(null, user);
			} else {
				if (user.failures === (env.loginFailures - 1)) {
					user.failures = 0;
					user.blocked = true;
				} else user.failures += 1;
				user.save(function(err) {
					callback(err, false, "wrong password");
				});
			}
		});
	}

	var User = mongo.model('user', UserSchema);
	return User;
});

