// module:
//		server/routes/admin
define([
	"dojo/Deferred",
	"dojo/promise/all",
	"../auth/access",
	"../node/error"
], function (Deferred, all, access, error) {
	return {
		children: function (user, params) {
			// summary:
			//		calculate children for the system admin
			var d = new Deferred();
			if (!user.root) d.reject(error.create(401, "Unauthorized"));
			else {
				all({ user: access.get('/admin/user', user), vendor: access.get('/admin/vendor', user) }).then(function (a) {
					d.resolve([
						{ "name": "users", "hash": "/admin/user", "access": a.user },
						{ "name": "vendors", "hash": "/admin/vendor", "access": a.vendor }
					]);
				}, d.reject);
			}
			return d.promise;
		}
	};
});