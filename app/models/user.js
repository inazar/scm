// module:
//		app/models/user
define([
	"dojo/_base/lang",
	"client/models/user",
	"dojo/store/JsonRest",
	"dojo/store/Observable"
], function (lang, User, JsonRest, Observable) {
	// summary:
	//		define JsonStore for user

	return Observable(new JsonRest(lang.mixin({
			target: '/user/',
			idProperty: '_id',
			sortParam: 'sort'
		}, User)));
});
