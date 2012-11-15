// module:
//		app/ctrls/profile
define([
	"dojo/_base/declare",
	"dojo/_base/config",
	"client/widgets/profile",
	"app/models/user"
], function (declare, dojoConfig, Profile, userStore) {
	// summary:
	//		Declare profile page. Simply show user's page with possibility to edit data
	return declare([Profile], {
		_id: dojoConfig.user,
		store: userStore
	});
});