// module:
//		server/routes/client
define([
	"../classes/Client",
	"dojo/Deferred",
	"dojo/when",
	"dojo/promise/all",
	"server/auth/access",
	"server/node/error"
], function (Client, Deferred, when, all, access, error) {

	var _children = {
		vendor: function (user, params) {
			var d = new Deferred(); sections = [];
			if (params.cid) {
				var prefix = "/client/vendor/"+params.cid;
				all({ user: access.get(prefix+"/user", user), supplier: access.get(prefix+"/supplier", user) }).then(function (a) {
					d.resolve([
						{ "name": "users", "hash": prefix+"/user", "access": a.user },
						{ "name": "suppliers", "hash": prefix+"/supplier", "access": a.supplier }
					]);
				}, d.reject);
			} else {
				when(user.Vendor, function(clients) {
					var roles = Client.roles, role, r = {}, i, promises = {};
					clients.forEach(function(client) {
						promises[client.id] = access.get('/client/vendor/'+client.id, user);
					});
					all(promises).then(function(a) {
						clients.forEach(function(client) {
							sections.push({
								"name": client.name,
								"hash": '/client/vendor/'+client.id,
								"access": a[client.id],
								"children": true
							});
						});
						d.resolve(sections);
					});
				}, d.reject);
			}
			return d.promise;
		},
		supplier: function (user, params) {

		},
		retailer: function (user, params) {

		}
	};

	return {
		children: function (user, params) {
			// summary:
			//		calculate children for the client given in params :cid, client's role is in :role
			if (Client.isRole(params.role)) {
				return _children[params.role](user, params);
			} else {
				return new Deferred().reject(error.create("BadRequest", "role is not valid"));
			}
		}
	};
});