// module:
//		app/ctrls/admin/user
define([
	"dojo/i18n!app/nls/user",
	"dojo/_base/declare",
	"app/ctrls/store/StackEdit",
	"app/models/admin/user"
], function (nls, declare, User, userStore) {
	// summary:
	//		Declare user page
	return declare([User], {
		nls: nls,
		store: userStore
	});
});
