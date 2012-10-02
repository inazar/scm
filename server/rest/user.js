define([
	"dojo/_base/declare",
	"server/classes/User"
], function (declare, User) {
	// module:
	//		server/routes/user
	return {
		"get": {
			handler: function (req, res, next) {
				var id = req.params.uid;
				if (id) {
					User.findById(id, function (err, user) {
						if (err) return next(err);
						res.send(user.toJSON());
					});
				} else res.send([]);
			},
			optional: ['uid'],
			validate: {
				'uid': function (params, user) {
					console.log("user GET validate", params.cid);
					if (user.root || params.uid === user.id) return true;
					return user.clients && user.clients.some(function(client) {
						return client.admins && client.admins.some(function (cUser) {
							return user.id === cUser.id;
						});
					});
				}
			}
		},
		"put": {
			handler: function (req, res, next) {
				var obj = req.body, id = req.params.uid; delete obj._id;
				if (id) {
					User.findByIdAndUpdate(id, obj, function(err, user) {
						if (err) return next(err);
						if (!user) return res.NotFound();
						res.send(user);
					});
				} else res.NotFound();
			},
			required: ['uid'],
			validate: {
				'uid': function (params, user) {
					console.log("user PUT validate", params.cid);
					if (user.root || params.uid === user.id) return true;
					return user.clients && user.clients.some(function(client) {
						return client.admins && client.admins.some(function (cUser) {
							return user.id === cUser.id;
						});
					});
				}
			}
		},
		"post": {
			handler: function (req, res, next) {
				console.log("user post");
				next();
			},
			validate: {
				'': function (params, user) {
					console.log("user POST validate");
					return true;
				}
			}
		},
		"delete": {
			handler: function (req, res, next) {
				console.log("user delete");
				next();
			},
			required: ['uid'],
			validate: {
				'uid': function (params) {
					console.log("user DELETE validate", params.uid);
					return true;
				}
			}
		}
	};
});