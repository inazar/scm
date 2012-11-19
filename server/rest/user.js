define([
	"dojo/_base/declare",
	"server/node/restify",
	"server/classes/User",
	"server/classes/Client",
	"server/classes/Relation",
	"dojo/Deferred",
	"dojo/when"
], function (declare, restify, User, Client, Relation, Deferred, when) {
	// module:
	//		server/routes/user

	function validator (params, user) {
		// root user can see everything, user can see himself
		if (user.root || params.uid && params.uid === user.id) return true;
		// now user can see others only if client is provided and this user is admin of the client
		if (params.cid) {
			var d = new Deferred(), cid = params.cid;
			when(user.admin, function (admins) {
				d.resolve(admins.some(function (a) { return a == cid; }));
			}, d.reject);
			return d.promise;
		} else return false;
	}

	return {
		"get": {
			handler: function (req, res, next) {
				var uid = req.params.uid, cid = req.params.cid;
				if (uid) {
					// if we look for particular user and are here just serve the user
					User.findById(uid, function (err, user) {
						if (err) return next(err);
						res.send(user);
					});
				} else {
					if (cid) {
						Client.findById(cid, function (err, client) {
							if (err) return next(err);
							// user is not specified so client shall be specified
							if (!client) return res.NotFound();
							// limit search to client users
							when(client.user, function (users) {
								restify.extend(User, users, req, res, next);
							}, next);
						});
					} else restify.extend(User, null, req, res, next); // user is root and wants to see admin users
				}
			},
			optional: ['uid'],
			validate: { 'uid': validator }
		},
		"put": {
			handler: function (req, res, next) {
				var obj = User.filter(req.body, req.user.root);
				User.findByIdAndUpdate(req.params.uid, obj, function(err, user) {
					if (err) return next(err);
					if (!user) return res.NotFound();
					res.send(user);
				});
			},
			required: ['uid'],
			validate: { 'uid': validator }
		},
		"post": {
			handler: function (req, res, next) {
				var obj = User.filter(req.body, req.user.root), cid = req.params.cid;
				User.create(obj, function(err, user) {
					if (err) return next(err);
					// set relation between user and client if user was created for a client
					when(cid ? (user.client = cid) : user, function() { res.send(user); }, next);
				});
			},
			validate: { '': validator }
		},
		"delete": {
			handler: function (req, res, next) {
				User.findByIdAndRemove(req.params.uid, function(err, user) {
					if (err) return next(err);
					if (!user) return res.NotFound();
					// remove all relations of the user
					Relation.where("user", user.id).remove(function (err) {
						if (err) next(err);
						else res.send();
					});
				});
			},
			required: ['uid'],
			validate: { 'uid': validator }
		}
	};
});