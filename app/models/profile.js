// module:
//		app/models/profile
define([
	"app/models/extend",
	"client/models/profile",
	"app/models/user"
], function (extend, Profile, User) {
	// summary:
	//		define JsonStore for user profile

	return extend(Profile, User);
});
