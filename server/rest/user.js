define([
	"dojo/_base/declare",
	"server/node/restify",
	"server/classes/User"
], function (declare, restify, User) {
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
				} else restify.extend(User, req, res, next);
			},
			optional: ['uid'],
			validate: {
				'uid': function (params, user) {
					console.log("user GET validate", params.uid);
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
					console.log("user PUT validate", params.uid);
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
				var obj = req.body;
				User.create(obj, function(err, user) {
					if (err) return next(err);
					res.send(user);
				});
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
				var id = req.params.uid;
				if (id) {
					User.findByIdAndRemove(id, function(err, user) {
						if (err) return next(err);
						if (!user) return res.NotFound();
						res.send(id);
					});
				} else res.NotFound();
			},
			required: ['uid'],
			validate: {
				'uid': function (params, user) {
					console.log("user DELETE validate", params.uid);
					return true;
				}
			}
		}
	};
});