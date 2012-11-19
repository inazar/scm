define([
	"dojo/_base/declare",
	"server/node/restify",
	"server/classes/User",
	"server/classes/Client",
	"server/classes/Relation",
	"dojo/Deferred",
	"dojo/when",
	"dojo/promise/all"
], function (declare, restify, User, Client, Relation, Deferred, when, all) {
	// module:
	//		server/routes/client
	return {
		"get": {
			handler: function (req, res, next) {
				var cid = req.params.cid;
				if (cid) {
					Client.findById(cid, function (err, client) {
						if (err) return next(err);
						res.send(client);
					});
				} else {
					if (req.user.root) restify.extend(Client, null, req, res, next);
					else {
						// user is admin of some client and may be trying to list sub-clients
						when(req.user.admin, function(parents) {
							Relation.find().where('parent')['in'](parents).exec(function (err, relation) {
								if (err) return next(err);
								restify.extend(Client, relation.map(function (r) { return r.child; }), req, res, next);
							});
						}, next);
					}
				}
			},
			required: ['role'],
			optional: ['cid'],
			validate: {
				'cid': function (params, user) {
					// root can see all clients
					if (user.root) return true;
					var d = new Deferred();
					if (params.cid) {
						// requested single client
						var cid = params.cid;
						// every client user can see it
						when(user.client, function(clients) {
							if (clients.some(function (c) { return c == cid; })) return d.resolve(true);
							Client.findById(cid, function(err, client) {
								if (err) return d.reject(err);
								if (!client) return res.NotFound();
								// every admin of parent can see it
								when(client.parent.admin, function(admins) {
									d.resolve(admins.some(function (u) { return u == user.id; }));
								});
							});
						}, d.reject);
					} else {
						// requested the list
						// user can list children of its administered clients
						when(user.admin, function (clients) {
							// if user is admin of some client - give him a chance!
							d.resolve(!!clients.length);
						}, d.reject);
					}
					return d.promise;
				}
			}
		},
		"put": {
			handler: function (req, res, next) {
				var obj = Client.filter(req.body, req.user.root);
				Client.findByIdAndUpdate(req.params.cid, obj, function(err, client) {
					if (err) return next(err);
					if (!client) return res.NotFound();
					res.send(client);
				});
			},
			required: ['role', 'cid'],
			validate: {
				'cid': function (params, user) {
					if (user.root) return true;
					// only client admin can edit client
					if (!params.cid) return false;
					var d = new Deferred(), cid = params.cid;
					when(user.admin, function (clients) {
						d.resolve(clients.some(function (c) { return c == cid; }));
					}, d.reject);
					return d.promise;
				}
			}
		},
		"post": {
			handler: function (req, res, next) {
				var obj = Client.filter(req.body, req.user.root), role = req.params.role;
				if (!Client.isRole(role)) return res.BadRequest("role is not allowed");
				obj.role = {}; obj.role[role] = true;
				Client.create(obj, function(err, user) {
					if (err) return next(err);
					res.send(user);
				});
			},
			required: ['role'],
			validate: {
				'': function (params, user) {
					// creation is allowed in chain root->vendor->supplier->retailer
					if (user.root) return true;
					if (!params.cid || !params.role) return false;
					var d = new Deferred(), cid = params.cid;
					when(user.admin, function(admins) {
						if (admins.some(function(a) { return a == cid; })) {
							Client.findById(cid, function(err, client) {
								if (err) return d.reject(err);
								d.resolve(client.canCreate(params.role));
							});
						} else d.resolve(false);
					}, d.reject);
					return d.promise;
				}
			}
		},
		"delete": {
			handler: function (req, res, next) {
				var cid = req.params.cid;
				Client.findByIdAndRemove(cid, function(err, client) {
					if (err) return next(err);
					if (!client) return res.NotFound();
					res.send();
				});
			},
			required: ['role', 'cid'],
			validate: {
				'cid': function (params, user) {
					// let root or parent admin delete client
					if (user.root) return true;
					var d = new Deferred();
					Client.findById(params.cid, function(err, client) {
						if (err) return next(err);
						if (!client) return res.NotFound();
						when(client.parent.admin, function(admins) {
							d.resolve(admins.some(function (u) { return u == user.id; }));
						}, d.reject);
					});
					return d.promise;
				}
			}
		}
	};
});