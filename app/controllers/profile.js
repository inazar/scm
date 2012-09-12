// module:
//		app/controllers/profile
define([
	"dojo/_base/declare",
	"dojo/_base/config",
	"app/controllers/admin/user",
	"app/models/user"
], function (declare, dojoConfig, User, userStore) {
	// summary:
	//		Declare profile page. Simply show user's page with possibility to edit data
	return declare([User], {
		constructor: function () {
			if (dojoConfig.user) {
				this.userId = dojoConfig.user;
				this.model = userStore;
				this.access = { "get": true, "put": true };
				this.control.set('store', userStore);
			}
		}
	});
});