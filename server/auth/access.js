// module:
//		server/auth/access

// summary:
//		This module defines access handling routines

define([
	"dojo/Deferred",
	"dojo/promise/all",
	"../node/router",
	"app/config"
], function (Deferred, all, Router, config) {
	var routes = config.routes, route, clientRouter = new Router();

	for(route in routes) {
		(function (route, cfg) {
			clientRouter.register(route, function () { return cfg; });
		})(route, routes[route]);
	}

	return {
		// template: Object
		//		access template object with node format:
		//	|	{
		//	|		name: String - the name of the node
		//	|		methods: Object? - array of supported methods
		//	|			{
		//	|				"get": Boolean,
		//	|				"put": Boolean,
		//	|				"post": Boolean,
		//	|				"delete": Booelan
		//	|			}
		//	|		hash: String? - if defined, node is shown in menu and routed to this hash
		//	|		children: Array? - array of child nodes
		//	|	}
		template: null,
		routers: { "get": new Router(), "put": new Router(), "post": new Router(), "delete": new Router() },
		get: function (route, user) {
			var promises = {}, d = new Deferred(), routers = this.routers, method, stores = clientRouter.getConfig(route);

			stores = stores && stores.stores || [];

			for (method in routers) {
				promises[method] = (function () {
					var sd = new Deferred(), sds = [];

					stores.forEach(function(store) {
						sds.push(routers[method].allow(store, user, clientRouter.getParameters(route)));
					});

					all(sds).then(function (allows) {
						sd.resolve(!allows.some(function (allow) { return !allow; }));
					}, sd.reject);

					return sd.promise;
				})(); // if no stores to check return false
			}

			all(promises).then(d.resolve, d.reject);

			return d.promise;
		}
	};
});
