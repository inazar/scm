// module:
//		app/ctrls/profile
define([
	"dojo/_base/declare",
	"dojo/_base/config",
	"client/widgets/profile",
	"app/models/profile"
], function (declare, dojoConfig, Profile, profileStore) {
	// summary:
	//		Declare profile page. Simply show user's page with possibility to edit data
	return declare([Profile], {
		_id: dojoConfig.user,
		store: profileStore
	});
});