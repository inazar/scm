// module:
//		server/classes/User
define([
	"../node/mongo",
	"../node/mongoose!Schema",
	"../node/mongoose!ObjectId",
	"../config/env",
	"./Client",
	"dojo/Deferred",
	"dojo/when",
	"dojo/promise/all",
	"../auth/access"
], function (mongo, Schema, ObjectId, env, Client, Deferred, when, all, access) {

	// summary:
	//		User database object
	var UserSchema = new Schema({
		admin: { type: Boolean, select: false },
		email: { type: String, index: true },   			// User's email
		name: { type: String },					 			// User's name
		confirmed: { type: Boolean },						// Weather user confirmed email
		secret: { type: String, select: false },			// Password hash
		blocked: { type: Boolean, 'default': false },		// Wheather user is blocked
		failures: { type: Number, 'default': 0 },			// Failed login attempts
		locale: { type: String },							// User's preferred locale
		clients: [{ type: ObjectId, ref: 'client' }]		// reference to customers
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
						user.getRoutes(callback);
					});
				} else user.getRoutes(callback);
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
	};

	UserSchema.methods.getClientUsers = function (callback) {
		// summary:
		//		Generate client id indexed object containing user records
		//		for clients, where user is admin
		var cids = {}, user = this;
		this.clients.forEach(function (client) {
			if (user.admin || client.admins && client.admins.indexOf(user.id) >= 0) {
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

		if (this.admin) {
			res.hash = '/admin';
			res.access = { "get": true, "post": true };
		} else res.noRoute = true;

		this.getClientUsers(function(err, cUsers) {
			if (err) return d.reject(err);
			// now create clients sections
			var admins = [];
			// get admin users edit links
			if (user.admin) admins.push((function(prefix) {
				var d = new Deferred();
				User.find({admin: true}).exec(function(err, admins) {
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
								hash: prefix + '/!' + user.id,
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

	UserSchema.methods.getRoutes = function (callback) {
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

		var user = this, clients;
		User.findById(user._id, '+admin').populate('clients').exec(function (err, user) {
			if (err) return callback(err);
			when((function(user) {
				// if user is global admin collect all clients
				if (user.admin) {
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
					if (client.supplier && client.supplier.length) suppliers.push(client);
					if (client.retailer && client.retailer.length) retailers.push(client);
					if (user.admin || client.admins.indexOf(user.id) >= 0) admin.push(client);
				});
				// create user's routes
				var sections = [ { name: 'Profile', hash: '/profile' } ];
				if (user.admin || admin.length) sections.push(user.getAdminSection(admin));
//				if (vendors.length) sections.push(user.getVendorSection(vendors));
//				if (suppliers.length) sections.push(user.getSupplierSection(suppliers));
//				if (retailers.length) sections.push(user.getRetailerSection(retailers));

				all(sections).then(function(routes) {
					user.routes = { name: 'root', children: routes };
					callback(null, user); 
				}, callback);
			});
		});
	};

	var User = mongo.model('user', UserSchema);
	return User;
});

