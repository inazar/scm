// module:
//		server/classes/User
define([
	"../node/mongo",
	"../node/mongoose!Schema",
	"../node/mongoose!ObjectId",
	"../config/env",
	"./Client",
	"./Relation",
	"dojo/Deferred",
	"dojo/when",
	"dojo/promise/all",
	"../auth/access",
	"../node/error"
], function (mongo, Schema, ObjectId, env, Client, Relation, Deferred, when, all, access, error) {

	// summary:
	//		User database object
	var UserSchema = new Schema({
		root: { type: Boolean, select: false },
		email: { type: String, index: {required: true, unique: true} },	// User's email
		name: { type: String },								// User's name
		confirmed: { type: Boolean },						// Weather user confirmed email
		secret: { type: String, select: false },			// Password hash
		blocked: { type: Boolean, 'default': false },		// Wheather user is blocked
		failures: { type: Number, 'default': 0 },			// Failed login attempts
		locale: { type: String },							// User's preferred locale
		code: { type: String}								// Confirmation code if any
	});

	// summary:
	//		getters/setters for user clients (user and admin)
	['client', 'admin'].forEach(function (field) {
		var role = (field === 'client' ? 'user' : 'admin'), self = this;
		// list clients or clients where user is admin
		UserSchema.virtual(field).get(function() {
			// summary:
			//		find all clients/admins of this user
			// return: Deferred
			//		The deferred resolves to the array of user's clients
			var d = new Deferred();
			if (this.root) {
				Client.find({}, '_id', function (err, clients) {
					if (err) d.reject(err);
					else d.resolve(clients.map(function (client) { return client._id; }));
				});
			} else {
				Relation.find({ role: role, user: this._id }).exec(function (err, relations) {
					if (err) d.reject(err);
					else d.resolve(relations.map(function (relation) { return relation.parent; }));
				});
			}
			return d.promise;
		}).set(function (cid) {
			// summary:
			//		add new client/admin of this user
			// cid: Client || ObjectId || String
			//		If ObjectId or String provided, Client is searched.
			// return: Deferred
			//		The deferred resolves to this user
			var d = new Deferred(), self = this;
			when(Relation.verifyId(cid, Client), function (cid) {
				Relation.findOne({ role: role, parent: cid, user: this._id }).exec(function (err, relation) {
					if (err) return d.reject(err);
					if (relation) return d.resolve(self);
					Relation.create({ role: role, parent: cid, user: self._id }, function (err) {
						if (err) d.reject(err);
						else d.resolve(self);
					});
				});
			}, d.reject);
			return d.promise;
		});
		// check if user is admin or user of a client
		UserSchema.methods['is'+field.slice(0, 1).toUpperCase()+field.slice(1)] = function(cid) {
			var d = Deferred();
			Relation.findOne({ role: role, parent: cid, user: this._id }).exec(function(err, relation) {
				if (err) d.reject(err);
				else d.resolve(!!relation);
			});
			return d.promise;
		};
	});

	UserSchema.virtual('Client').get(function() {
		var d = new Deferred();
		if (this.root) {
			Client.find({}, function (err, clients) {
				if (err) d.reject(err);
				else d.resolve(clients);
			});
		} else {
			Relation.find({ role: 'user', user: this._id }).populate('parent').exec(function (err, relations) {
				if (err) d.reject(err);
				else d.resolve(relations.map(function (relation) { return relation.parent; }));
			});
		}
		return d.promise;
	});

	// per role - Vendor, Supplier, Retailer
	// retrieve clients of the type where user is registered
	Client.roles.forEach(function(role) {
		UserSchema.virtual(role.charAt(0).toUpperCase()+role.slice(1)).get(function() {
			var d = new Deferred(), query = {role: {}}; query.role[role] = true;
			if (this.root) {
				Client.find(query, function (err, clients) {
					if (err) d.reject(err);
					else d.resolve(clients);
				});
			} else {
				Relation.find({ user: this._id }).where('role')['in'](['user', 'admin']).populate('parent', null, query).exec(function (err, relations) {
					if (err) d.reject(err);
					else d.resolve(relations.map(function (relation) { return relation.parent; }));
				});
			}
			return d.promise;
		});
	});

	var _safe = [], _root = [];
	Object.keys(UserSchema.paths).forEach(function(key) {
		var o = UserSchema.paths[key].options;
		if (!o.auto) {
			_root.push(key);
			if (o.select !== false) _safe.push(key);
		}
	});

	UserSchema.statics.filter = function(raw, root) {
		var obj = {}, i, key, sf = root ? _root : _safe;
		for (i=0; i<sf.length; i++) {
			key = sf[i];
			if (raw[key] !== undefined) obj[key] = raw[key];
		}
		return obj;
	};

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
		var d = new Deferred();
		User.findOne({email: email, confirmed: true}, '+secret', function(err, user) {
			if (err) return d.reject(err);
			if (!user) return d.resolve(false, "user unknown");
			if (user.blocked) return d.resolve(false, "user blocked");
			if (user.secret === pwd) {
				if (user.failures) {
					user.failures = 0;
					user.save(function (err) {
						if (err) d.reject(err);
						else d.resolve(user);
					});
				} else d.resolve(user);
			} else {
				if (user.failures === (env.loginFailures - 1)) {
					user.failures = 0;
					user.blocked = true;
				} else user.failures += 1;
				user.save(function(err) {
					if (err) d.reject(err);
					else d.resolve(false, "wrong password");
				});
			}
		});
		if (callback) when(d, function (match, info) { callback(null, match, info); }, callback);
		return d.promise;
	};

	UserSchema.methods.routes = function(hash) {
		// summary:
		//		method will be called by routes handler to find children for some route
		var d = new Deferred(), router = access.router, user = this;
		require(['server/routes/'+router.map('/' + hash)], function (route) {
			if (!route) d.reject(error.BadRequest("Route not found"));
			else when(route.children(user, router.params('/' + hash)), d.resolve, d.reject);
		});
		return d.promise;
	};

	var User = mongo.model('user', UserSchema);
	return User;
});

