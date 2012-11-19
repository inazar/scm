// module:
//		server/auth/access

// summary:
//		This module defines access handling routines

define([
	"dojo/Deferred",
	"dojo/when",
	"dojo/promise/all",
	"dojo/_base/lang",
	"../node/router",
	"app/config"
], function (Deferred, when, all, lang, Router, config) {
	var routes = config.routes, route, clientRouter = new Router();

	for(route in routes) {
		(function (route, cfg) {
			clientRouter.register(route, cfg);
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
		router: clientRouter,
		template: null,
		routers: { "get": new Router(), "put": new Router(), "post": new Router(), "delete": new Router() },
		get: function (route, user) {
			var self = this, promises = {}, d = new Deferred(), routers = this.routers, method;

			require(['server/routes/'+clientRouter.map(route)], function(r) {
				var stores = r.stores || [], method;
				for (method in routers) {
					promises[method] = (function (m) {
						var asd = new Deferred(), sds = [];

						stores.forEach(function(store) {
							var sd = new Deferred();
							require(['server/rest'+store], function(s) {
								when(routers[m].allow(store + self.getParams(s[m].required, s[m].optional), user, clientRouter.params(route)), sd.resolve, sd.reject);
							});
							sds.push(sd.promise);
						});

						all(sds).then(function (allows) {
							asd.resolve(!allows.some(function (allow) { return !allow; }));
						}, asd.reject);

						return asd.promise;
					})(method); // if no stores to check return false
				}

				all(promises).then(d.resolve, d.reject);
			});

			return d.promise;
		}
	};
});
