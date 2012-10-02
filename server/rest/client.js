define([
	"dojo/_base/declare",
	"server/classes/Client"
], function (declare, Client) {
	// module:
	//		server/routes/client
	return {
		"get": {
			handler: function (req, res, next) {
				var id = req.params.cid;
				if (id) {
					Client.findById(id, function (err, client) {
						if (err) return next(err);
						res.send(client.toJSON());
					});
				} else res.send([]);
			},
			optional: ['cid'],
			validate: {
				'cid': function (params, user) {
					console.log("client GET validate", params.cid);
					return true;
				}
			}
		},
		"put": {
			handler: function (req, res, next) {
				next();
			},
			required: ['cid'],
			validate: {
				'cid': function (params, user) {
					console.log("client PUT validate", params.cid);
					return true;
				}
			}
		},
		"post": {
			handler: function (req, res, next) {
				client = req.body;
				if (client.vendor && !req.user.admin) return res.Unauthorized();
// TODO				if (client.supplier && !req.client.admins.indexOf(req.user.id)) return res.Unauthorized();
				Client.create(client, function(err, client) {
					if (err) return next(err);
					res.send(client);
				});
			},
			validate: {
				'': function (params, user) {
					console.log("client POST validate");
					return true;
				}
			}
		},
		"delete": {
			handler: function (req, res, next) {
				console.log("user delete");
				next();
			},
			required: ['cid'],
			validate: {
				'cid': function (params) {
					console.log("client DELETE validate", params.cid);
					return true;
				}
			}
		}
	};
});