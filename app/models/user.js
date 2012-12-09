// module:
//		app/models/user
define([
	"app/config",
	"dojo/cookie",
	"dojo/_base/lang",
	"client/models/user",
	"dojo/store/JsonRest",
	"dojo/store/Observable"
], function (config, cookie, lang, User, JsonRest, Observable) {
	// summary:
	//		define JsonStore for user

	return Observable(new JsonRest(lang.mixin({
			target: '/user/',
			idProperty: '_id',
			sortParam: 'sort',
			headers: { "X-CSRF-Token": cookie(config.csrf) }
		}, User)));
});
