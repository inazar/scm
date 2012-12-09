// module:
//		app/models/user/admin
define([
	"dojo/_base/lang",
	"app/models/user",
	"client/models/admin/admin",
	"app/models/extend"
], function (lang, User, user, extend) {
	// summary:
	//		define JsonStore for user/admin based on user store

	var model = extend({pre: '/admin', target: '/admin/'}, User);
	lang.mixin({query: {root: true}}, model, user);
	return model;
});
