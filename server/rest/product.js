define([
	"dojo/_base/lang",
	"server/node/utils",
	"server/node/restify",
	"server/classes/Product",
	"server/classes/Client",
	"dojo/Deferred",
	"dojo/when"
], function (lang, utils, restify, Product, Client, Deferred, when) {
	// module:
	//		server/rest/product

	function validator (method, params, user, log) {
		// summary:
		//		Validate request based on input params for product store
		//	description:
		//		Accept request from root at:
		//		(1) /product/:prid. User must be root.
		//		(2) /parent/:role/:pid/product/:prid? provide access according to user rights
		//			to vendor user and GET access for vendor's supplier users with access rights
		//	method: String the request method
		//	params: Object Contains request params - role, pid, prid?
		//	user: User Currently logged in user
		//	returns:
		//			Boolean or Promise which resolves to Boolean

		// root user can see everything, user can see himself
		if (user.root && params.role === Client.roles[0]) return utils.validate('product', method, params, user, true, log);
		// user is not root so pid must be provided, role must be first role - vendor
		if (!params.pid || params.role !== Client.roles[0]) return utils.validate('product', method, params, user, false, log);
		// now user can see others only if this user is admin of the parent
		return utils.validate('product', method, params, user, user.access(params.pid, 'product', method), log);
	}

	return {
		"get": {
			handler: function (req, res, next) {
				var params = req.params, prid = params.prid, pid = params.pid, role = params.role, self = this;
				if (prid) {
					Product.findById(prid, self.select, function (err, product) {
						if (err) next(err);
						else res.send(product);
					});
				} else restify.extend(Product, {query: pid ? {owner: pid} : {}, select: self.select}, req, res, next);
			},
			optional: ['prid'],
			validate: { 'prid': lang.partial(validator, "GET") }
		},
		"put": {
			handler: function (req, res, next) {
				var obj = Product.filter(req.body, req.user.root), prid = req.params.prid;
				Product.findByIdAndUpdate(prid, obj, function(err, product) {
					if (err) return next(err);
					if (!user) return res.NotFound();
					res.send(product);
				});
			},
			required: ['prid'],
			validate: { 'prid': lang.partial(validator, "PUT") }
		},
		"post": {
			handler: function (req, res, next) {
				var obj = Product.filter(req.body, req.user.root);
				obj.owner = req.params.pid;
				Product.create(obj, function(err, product) {
					if (err) next(err);
					else res.send(product);
				});
			},
			validate: { '': lang.partial(validator, "POST") }
		},
		"delete": {
			handler: function (req, res, next) {
				var prid = req.params.prid;
				Product.findByIdAndRemove(prid, function(err, product) {
					if (err) return next(err);
					if (!product) return res.NotFound();
					res.send();
				});
			},
			required: ['prid'],
			validate: { 'prid': lang.partial(validator, "DELETE") }
		}
	};
});