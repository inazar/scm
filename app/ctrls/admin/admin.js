// module:
//		app/ctrls/admin/admin
define([
	"dojo/i18n!app/nls/user",
	"dojo/_base/declare",
	"app/ctrls/store/GridEdit",
	"app/models/admin/admin"
], function (nls, declare, User, adminStore) {
	// summary:
	//		Declare admin page
	return declare([User], {
		nls: nls,
		store: adminStore
	});
});
