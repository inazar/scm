// module:
//		app/ctrls/admin/user
define([
	"dojo/_base/declare",
	"client/widgets/admin/user",
	"app/models/user"
], function (declare, User, userStore) {
	// summary:
	//		Declare client admin page
	return declare([User], {
		store: userStore,
		query: {root: true}
	});
});
