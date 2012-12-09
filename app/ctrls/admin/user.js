// module:
//		app/ctrls/admin/admin
define([
	"dojo/i18n!app/nls/user",
	"dojo/_base/declare",
	"app/ctrls/store/GridEdit",
	"app/models/admin/user"
], function (nls, declare, User, userStore) {
	// summary:
	//		Declare user page
	return declare([User], {
		nls: nls,
		store: userStore
	});
});
