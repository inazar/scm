define([
	"dojo/_base/lang",
	"server/node/utils",
	"server/node/restify",
	"server/classes/User",
	"server/classes/Client",
	"server/classes/Relation",
	"dojo/Deferred",
	"dojo/when",
	"dojo/promise/all"
], function (lang, utils, restify, User, Client, Relation, Deferred, when, all) {
	// module:
	//		server/routes/client
	
	function validator (method, child, params, user, log) {
		// summary:
		//		Validate request based on input params for client store
		//	description:
		//		Accept request from root at:
		//		(1) /client:cid?. User must be root. In this case role = vendor, pid = null.
		//		(2) /parent/:role/:pid/client/:cid? only if user is root (in this case
		//			role and pid may be skipped and if skipped later default to role = vendor, pid = null)
		//			or child = true and expects all params
		//		Authorize any type of access for root, for other check wheather user is admin
		//		of parent (parent admin manage children in the same way as root) or child is true, cid is given
		//		(client admin can see and edit itself)
		//	method: String the request method
		//	child: Boolean wheather request of type (2) is alowed
		//	params: Object Contains request params - role, pid, cid?
		//	user: User Currently logged in user

		// root can do what he wants
		if (user.root) return utils.validate('client', method, params, user, true, log);
		
		
		if (!params.pid ||										// user is not root so pid must be provided
			!params.role ||										// role must be provided
			!Client.isRole(params.role) ||						// role value must be valid
			(!params.cid && Client.lastRole(params.role)) ||	// last role has no children
			(child && !params.cid)								// child is true and no cid provided
			) return utils.validate('client', method, params, user, false, log); // invalid!
		// now user is not root and pid, role are provided
		var d = new Deferred();
		// check if user is admin or parent
		var check = {parent: Relation.is('admin', params.pid, user.id)};
		// or admin of client if client known
		if (params.cid) check.user = Relation.is('admin', params.cid, user.id);
		all(check).then(function(res) { d.resolve(res.user || res.parent); }, d.reject);
		return utils.validate('client', method, params, user, d.promise, log);
	}

	return {
		"get": {
			handler: function (req, res, next) {
				var cid = req.params.cid, pid = req.params.pid, role = req.params.role, self = this, d;
				if (cid) {
					// request is specific for the client
					Client.findById(cid, self.select, function (err, client) {
						if (err) return next(err);
						res.send(client);
					});
				} else {
					// if user is root list vendors otherwise list child role of role under pid
					if (role) {
						Relation.find({role: role, parent: pid}).exec(function (err, children) {
							var query = {};
							query["role."+Client.childRole(role)] = true;
							if (err) return next(err);
							restify.extend(Client, {
								query: query,
								restrict: children.map(function(c){ return c.child; }),
								select: self.select
							}, req, res, next);
						});
					} else restify.extend(Client, { query: {"role.vendor": true}, select: self.select }, req, res, next);
				}
			},
			optional: ['cid'],
			validate: { '': lang.partial(validator, "GET", true) }
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
			required: ['cid'],
			validate: { '': lang.partial(validator, "PUT", true) }
		},
		"post": {
			handler: function (req, res, next) {
				var obj = Client.filter(req.body, req.user.root), user = req.user, params = req.params;
				// client is created and role value is defined by route
				obj.role = {}; obj.role[req.params.role ? Client.childRole(req.params.role) : "vendor"] = true;
				Client.create(obj, function(err, client) {
					if (err) return next(err);
					// set relation user and parent to client in "transaction way"
					Relation.create([
						{role: req.params.role || "vendor", parent: params.pid, child: client.id},
						{role: "admin", parent: client.id, user: user.id}
					], function(err) {
						if (err) next(err);
						else res.send(client);
					});
				});
			},
			validate: { '': lang.partial(validator, "POST", false) }
		},
		"delete": {
			handler: function (req, res, next) {
				var cid = req.params.cid;
				Client.findByIdAndRemove(cid, function(err, client) {
					if (err) return next(err);
					if (!client) return res.NotFound();
					// remove all relations in "transaction way"
					Relation.find({$or: [{parent: client.id}, {child: client.id}]}).remove(function(err) {
						if (err) next(err);
						else res.send();
					});
				});
			},
			required: ['cid'],
			validate: { '': lang.partial(validator, "DELETE", false) }
		}
	};
});