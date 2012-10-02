// module:
//		server/routes
define([
	"../classes/Client",
	"dojo/Deferred",
	"dojo/when"
], function (Client, Deferred, when) {
	return {
		children: function (user, params) {
			// summary:
			//		calculate children for the root
			var d = new Deferred(); sections = [{ "name": "profile", "hash": "/profile", "access": { "get": true, "put": true } }];
			if (user.root) sections.push({
				"name": "admin",
				"hash": "/admin",
				"children": true
			});
			when(user.Client, function(clients) {
				var roles = Client.roles, role, r = {}, i;
				clients.forEach(function(client) {
					for (i=0; i<roles.length; i++) {
						role = roles[i];
						if (client[role]) r[role] = true;
					}
				});
				for (i=0; i<roles.length; i++) {
					role = roles[i];
					if (r[role]) sections.push({
						"name": role,
						"hash": '/'+role,
						"children": true
					});
				}
				d.resolve(sections);
			}, d.reject);
			return d.promise;
		}
	};
});