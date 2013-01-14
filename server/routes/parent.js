// module:
//		server/routes/client
define([
	"server/classes/Client",
	"dojo/Deferred",
	"dojo/when",
	"dojo/promise/all",
	"server/auth/access",
	"server/node/error"
], function (Client, Deferred, when, all, access, error) {

	return {
		children: function (user, params) {
			// summary:
			//		calculate children for the client given in params :cid, client's role is in :role
			var role = params.role, pid = params.pid, d = new Deferred();
			if (role && Client.isRole(role)) {
				if (pid) {
					var prefix = "/parent/"+role+"/"+pid,
						permissions = {
							user: access.get(prefix+"/user", user),
							client: access.get(prefix+"/client", user),
							product: access.get(prefix+"/product", user),
							order: access.get(prefix+"/order", user),
							supply: access.get(prefix+"/supply", user)
						};
					all(permissions).then(function (a) {
						var sections = [];
						if (a.user["get"]) sections.push({ name: "users", hash: prefix+"/user", access: a.user });
						if (a.client && a.client["get"]) sections.push({ name: Client.childRole(role)+"s", hash: prefix+"/client", access: a.client });
						if (a.product && a.product["get"]) sections.push({ name: "products", hash: prefix+"/product", access: a.product });
						if (a.order && a.order["get"]) sections.push({ name: "orders", hash: prefix+"/order", access: a.order });
						if (a.supply && a.supply["get"]) sections.push({ name: "supplies", hash: prefix+"/supply", access: a.supply });
						d.resolve(sections);
					}, d.reject);
				} else {
					when(user[role.charAt(0).toUpperCase()+role.slice(1)], function(clients) {
						var sections = [];
						clients.forEach(function(client) {
							sections.push({
								"name": client.name,
								"hash": '/parent/'+role+'/'+client.id,
								"children": true
							});
						});
						d.resolve(sections);
					}, d.reject);
				}
			} else d.reject(error.create("BadRequest", "role is not valid"));
			return d.promise;
		}
	};
});