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
	"../auth/access"
], function (mongo, Schema, ObjectId, env, Client, Relation, Deferred, when, all, access) {

	// summary:
	//		User database object
	var UserSchema = new Schema({
		root: { type: Boolean },
		email: { type: String, index: true },   			// User's email
		name: { type: String },					 			// User's name
		confirmed: { type: Boolean },						// Weather user confirmed email
		secret: { type: String, select: false },			// Password hash
		blocked: { type: Boolean, 'default': false },		// Wheather user is blocked
		failures: { type: Number, 'default': 0 },			// Failed login attempts
		locale: { type: String },							// User's preferred locale
		clients: [{ type: ObjectId, ref: 'client' }]		// reference to customers
	});

	// summary:
	//		getters/setters for user clients (user and admin)
	['client', 'admin'].forEach(function (field) {
		var role = (field === 'client' ? 'user' : 'admin'), self = this;
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
			if (this.root) d.resolve(this);
			else {
				when(_verifyId(cid, Client), function (cid) {
					Relation.find({ role: role, parent: cid, user: this._id }).exec(function (err, relation) {
						if (err) return d.reject(err);
						if (relation && relation.length) return d.resolve(self);
						Relation.create({ role: role, parent: cid, user: self._id }).exec(function (err) {
							if (err) d.reject(err);
							else d.resolve(self);
						});
					});
				}, d.reject);
			}
			return d.promise;
		});
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
			when(route.children(user, router.params('/' + hash)), d.resolve, d.reject);
		});
		return d.promise;
	};



/***************************************
	UserSchema.methods.getClientUsers = function (callback) {
		// summary:
		//		Generate client id indexed object containing user records
		//		for clients, where user is admin
		var cids = {}, user = this;
		this.clients.forEach(function (client) {
			if (user.root || client.admins && client.admins.indexOf(user.id) >= 0) {
				var d = cids[client.id] = new Deferred();
				User.find({
					clients: { $elemMatch: { id: client.id } }		// client is listed in user's clients
				}).exec(function (err, users) {
					if (err) d.reject(err);
					else d.resolve(users);
				});
			}
		});
		// gather all users per client id
		all(cids).then(function (res) { callback(null, res); }, callback);
	};

	UserSchema.methods.getAdminSection = function (admin) {
		// summary:
		//		create admin section for routes
		//			admin page contains 'create client' page for global admin and nothing for others
		//			admin section contains clients managed by current admin user
		//			each client page contains 'create client' if client role alows sub-clients
		//			each client section contains users page and clients page
		//			users page contains form to create new user
		//			users section contains list of users with edit form
		//			clients page contains form to create new client
		//			clients section contains list of clients with edit form

		var d = new Deferred(), user = this, res = { name: 'admin' };

		if (this.root) {
			res.hash = '/admin';
			res.access = { "get": true, "post": true };
		} else res.noRoute = true;

		this.getClientUsers(function(err, cUsers) {
			if (err) return d.reject(err);
			// now create clients sections
			var admins = [];
			// get admin users edit links
			if (user.root) admins.push((function(prefix) {
				var d = new Deferred();
				User.find({root: true}).exec(function(err, admins) {
					if (err) return d.reject(err);
					var cp = [];
					admins.forEach(function(user) {
						cp.push(access.get(prefix + '/' + user.id, user));
					});
					all(cp).then(function (access) {
						var children = [];
						admins.forEach(function (user, i) {
							children.push({
								name: user.name + ' (' + user.email + ')',
								hash: prefix + '/' + user.id,
								access: access[i]
							});
						});
						d.resolve({
							name: 'users',
							hash: prefix,
							noRoute: true,
							children: children
						});
					}, d.reject);
				});
				return d.promise;
			})('/admin/users'));
			admin.forEach(function (client) {
				admins.push(client.getAdminSection('/admin', cUsers[client.id], user));
			});
			all(admins).then(function(children) {
				if (children && children.length) res.children = children;
				d.resolve(res);
			}, d.reject);
		});

		return d.promise;
	};

	UserSchema.methods.getVendorSection = function (vendors) {
		// summary:
		// create vendor section for routes
		var d = new Deferred(), user = this;

		return d.promise;
	};

	UserSchema.methods.getSupplierSection = function (suppliers) {
		// summary:
		// create supplier section for routes
		var d = new Deferred(), user = this;

		return d.promise;
	};

	UserSchema.methods.getRetailerSection = function (retailers) {
		// summary:
		// create retailer section for routes
		var d = new Deferred(), user = this;

		return d.promise;
	};




	UserSchema.methods._sortClients = function () {
		// summary:
		//		sort the clients according to it's role
		//		Deferred is resolved to array of admin's ids and object of arrays of ids according to Client.roles
		var d = new Deferred(), user = this;
		all([user.admin, user.client]).then(function(admins, clients) {
			var sorted = {}, i;
			for (i=0; i<clients.length; i++) {
				Client.roles.forEach(function (role) {
					if (clients[i][role]) {
						if (!sorted[role]) sorted[role] = [];
						sorted[role].push(clients[i]);
					}
				});
			}
			d.resolve(admins, sorted);
		}, d.reject);
		return d.promise;
	}






	UserSchema.methods._getRoutes = function (d) {
		// summary:
		//		Generate user access object in the format of client tree
		//		Each client route is based on some REST routes. Client routes are defined 
		//		by app/routes handlers describing route dependencies and providing necessary methods
		//		to calculate subroutes. This method creates a tree based on it and attach to user
		//		1) populate profile section
		//		2) get customers related to the user and sort then out to vendor/supplier/retailer
		//		3) check if user has admin rights general or per customer and populate admin section
		//			- users - based on REST/user access rights
		//			- clients - based on REST/client access rights
		//		4) for vendor create vendor tab and add vendor with search/list capabiltiy based on REST/vendor/:id
		//		5) for supplier create supplier tab and add PO/Stock/Staticstics based on REST/supplier/:id
		//		6) for retailer create retailer tab and add Order/Summary/Statistics based on REST/retailer/:id


		if (!d) d = new Deferred();
		var user = this, sections = [{ name: 'Profile', hash: '/profile' }];
		// root user can administer other roots
		if (user.root) sections.push(user.getRootSection());
		when(user._sortClients(), function (admin, clients) {
			Client.roles.forEach(function(role) {
				if (clients[role])
			});
		}, d.reject);






		when(user.admin, function (admins) {
			if (admins && admins.length) sections.push()
		}, d.reject);



		User.findById(user._id, '+root').exec(function (err, user) {
			if (err) return d.reject(err);



			when((function(user) {
				// if user is global admin collect all clients
				if (user.root) {
					var cd = new Deferred();
					Client.find({}, function(err, c) {
						if (err) return cd.reject(err);
						clients = c;
						cd.resolve(user);
					});
					return cd.promise;
				} else {
					clients = user.clients;
					return user;
				}
			})(user), function(user) {
				// user contains properly populated field clients
				var vendors = [], suppliers = [], retailers = [], admin = [];
				clients.forEach(function(client) {
					if (client.vendor) vendors.push(client);
					if (client.supplier) suppliers.push(client);
					if (client.retailer) retailers.push(client);
					if (user.root || client.admins.indexOf(user.id) >= 0) admin.push(client);
				});
				// create user's routes
				var sections = [ { name: 'Profile', hash: '/profile' } ];
				if (user.root || admin.length) sections.push(user.getAdminSection(admin));
//				if (vendors.length) sections.push(user.getVendorSection(vendors));
//				if (suppliers.length) sections.push(user.getSupplierSection(suppliers));
//				if (retailers.length) sections.push(user.getRetailerSection(retailers));

				all(sections).then(function(routes) {
					user.routes = { name: 'root', children: routes };
					callback(null, user); 
				}, callback);
			}, d.reject);
		});
		return d.promise;
	};
****************************/

	var User = mongo.model('user', UserSchema);
	return User;
});

