// module:
//		app/models/user/admin
define([
	"dojo/_base/lang",
	"app/models/user",
	"client/models/admin/user",
	"app/models/extend"
], function (lang, User, user, extend) {
	// summary:
	//		define JsonStore for user/admin based on user store

	var model = extend({pre: '/admin'}, User);
	lang.mixin({query: {root: {$not: true}}}, model, user);
	return model;
});
