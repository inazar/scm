define([
	"dojo/_base/declare",
	"server/classes/User"
], function (declare, User) {
	// module:
	//		server/routes/user
	return {
		"get": {
			handler: function (req, res, next) {
				var id = req.params.id;
				if (id) {
					User.findById(id, function (err, user) {
						if (err) return next(err);
						res.send(user.toJSON());
					});
				} else res.send([]);
			},
			optional: ['id'],
			validate: {
				'id': function (params, user) {
					if (user.admin || params.id === user.id) return true;
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
				var obj = req.body, id = req.params.id; delete obj._id;
				if (id) {
					User.findByIdAndUpdate(id, obj, function(err, user) {
						if (err) return next(err);
						if (!user) return res.NotFound();
						res.send(user);
					});
				} else res.NotFound();
			},
			required: ['id'],
			validate: {
				'id': function (params, user) {
					if (user.admin || params.id === user.id) return true;
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
			}
		},
		"delete": {
			handler: function (req, res, next) {
				console.log("user delete");
				next();
			},
			required: ['id'],
			validate: {
				'id': function (params) {
					console.log("user validate", params.id);
					return true;
				}
			}
		}
	};
});