// module:
//		server/classes/User
define([
	"../node/mongo",
	"../node/mongoose!Schema",
	"../node/mongoose!ObjectId",
	"../config/env",
	"./Client",
	"dojo/Deferred",
	"dojo/when"
], function (mongo, Schema, ObjectId, env, Client, Deferred, when) {

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
						_getRoutes(user, callback);
					});
				} else _getRoutes(user, callback);
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

	function _getRoutes (user, callback) {
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

		var routes = [];
		// user's profile
		routes.push({
			name: 'Profile',
			hash: '/profile'
		});
		// get clients
		User.findById(user._id).populate('clients').exec(function (err, user) {
			if (err) return callback(err);
			when((function(user) {
				if (user.admin) {
					var cd = new Deferred();
					Client.find({}, function(err, clients) {
						if (err) cd.reject(err);
						else {
							user.clients = clients;
							cd.resolve(user);
						}
					});
					return cd.promise;
				} else return user;
			})(user), function(user) {
				var clients = user.clients || [], vendors = [], suppliers = [], retailers = [], admin = [];
				clients.forEach(function(client) {
					if (client.role) {
						if (client.role.vendor) vendors.push(client);
						if (client.role.supplier) suppliers.push(client);
						if (client.role.retailer) retailers.push(client);
					}
					if (user.admin || client.admins.indexOf(user.id) >= 0) admin.push(client);
				});
				function _populate (clients, name, noRoute) {
					var children = [], hash = '/' + name,
						route = {
							name: name,
							hash: hash
						};
					if (clients.length) {
						clients.forEach(function (client) {
							children.push({
								name: client.name,
								hash: hash + client.id
							});
						});
						route.children = children;
					}
					if (noRoute) route.noRoute = true;
					routes.push(route);
					return route;
				}
				// populate admin section
				if (user.admin || admin.length) {
					var route = _populate(admin, 'admin');
					if (user.admin) {
						route.access = { post: true, role: ["vendor", "supplier", "retailer"] };
					}
				}
				// populate vendor section
				if (vendors.length) _populate(vendors, 'vendor');
				// populate supplier section
				if (suppliers.length) _populate(suppliers, 'supplier', true);
				// populate retailer section
				if (retailers.length) _populate(retailers, 'retailer', true);
				user.routes = { name: 'root', children: routes };
				callback(null, user);
			}, callback);
		});
	}

	var User = mongo.model('user', UserSchema);
	return User;
});

