define([
	"dojo/_base/lang",
	"server/node/utils",
	"server/node/restify",
	"server/classes/User",
	"server/classes/Client",
	"server/classes/Relation",
	"dojo/Deferred",
	"dojo/when",
	"server/config/env",
	"server/node/mail"
], function (lang, utils, restify, User, Client, Relation, Deferred, when, env, mail) {
	// module:
	//		server/routes/user

	function validator (method, params, user, log) {
		// summary:
		//		Validate request based on input params for user store
		//	description:
		//		Accept request from root at:
		//		(1) /user/:uid. uid refers to currently logged in user
		//		(2) /admin/admin:uid?, /admin/user:uid?. User must be root.
		//		(3) /parent/:role/:pid/user/:uid? only if user is root (in this case
		//			role and pid may be skipped and if skipped later default to role = vendor, pid = null)
		//			or current user is and admin of parent
		//		Authorize any type of access for root, for other check wheather user is admin
		//		of parent (parent admin manage children in the same way as root). Also user can manage his own record
		//	method: String the request method
		//	params: Object Contains request params - role, pid, cid?
		//	user: User Currently logged in user

		// root user can see everything, user can see himself
		if (user.root || params.uid && params.uid === user.id) return utils.validate('user', method, params, user, true, log);
		if (!params.pid ||										// user is not root so pid must be provided
			!params.role ||										// role must be provided
			!Client.isRole(params.role)							// role value must be valid
			) return utils.validate('user', method, params, user, false, log); // invalid!
		// now user can see others only if this user is admin of the parent
		return utils.validate('user', method, params, user, Relation.is("admin", params.pid, user.id), log);
	}

	return {
		"get": {
			handler: function (req, res, next) {
				var uid = req.params.uid, pid = req.params.pid, role = req.params.role, self = this;
				if (uid) {
					// if we look for particular user and are here just serve the user
					User.findById(uid, self.select, function (err, user) {
						if (err) next(err);
						else res.send(user);
					});
				} else {
					// if user is root list all users defined by query, otherwise list users under pid
					if (role) {
						Relation.find({role: "user", parent: pid}).exec(function (err, users) {
							if (err) return next(err);
							restify.extend(User, {
								query: self.query,
								restrict: users.map(function(c){ return c.user; }),
								select: self.select
							}, req, res, next);
						});
					} else restify.extend(User, {query: self.query, select: self.select}, req, res, next);
				}
			},
			optional: ['uid'],
			validate: { 'uid': lang.partial(validator, "GET") }
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
			validate: { 'uid': lang.partial(validator, "PUT") }
		},
		"post": {
			handler: function (req, res, next) {
				var obj = User.filter(req.body, req.user.root), pid = req.params.pid;
				function _sendMail(user) {
					// send email to userutils.encode({email: email, code: code})
					mail(user.email, 'Confirm registration', "http://"+env.host+env.confirm+'?hash='+utils.encode({email: user.email, code: user.code}));
				}
				// Avoid creation of user with the same email
				User.findOne({email: obj.email}, function (err, user) {
					if (err) return next(err);
					if (user) {
						when(Relation.relate("user", pid, user), function() {
							if (user.get("code")) _sendMail(user);
							res.send(user);
						}, next);
					} else {
						obj.code = utils.uid(5);
						User.create(obj, function(err, user) {
							if (err) return next(err);
							// set relation between user and client if user was created for a client
							when(Relation.relate("user", pid, user), function() {
								_sendMail(user);
								res.send(user);
							}, next);
						});
					}
				});
			},
			validate: { '': lang.partial(validator, "POST") }
		},
		"delete": {
			handler: function (req, res, next) {
				var uid = req.params.uid, pid = req.params.pid;
				// users are never deleted !!!
				if (pid) {
					Relation.find({role: "user", parent: pid, user: uid}).remove(function(err) {
						if (err) return next(err);
						else res.send(true);
					});
				} else {
					// user is not admin anymore - keep other setting
					// never delete last admin!!!
					User.count({root: true}, function(err, count) {
						if (err) return next(err);
						if (count === 1) return res.Forbidden();
						User.findByIdAndUpdate(uid, {root: false}).exec(function(err, user) {
							if (err) return next(err);
							if (!user) res.NotFound();
							else res.send(true);
						});
					});
				}
			},
			required: ['uid'],
			validate: { 'uid': lang.partial(validator, "DELETE") }
		}
	};
});