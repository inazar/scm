// module:
//		app/models/client
define([
	"dojo/_base/lang",
	"client/models/client",
	"dojo/store/JsonRest",
	"dojo/store/Observable"
], function (lang, Client, JsonRest, Observable) {
	// summary:
	//		define JsonStore for client

	return Observable(new JsonRest(lang.mixin({
			idProperty: '_id',
			sortParam: 'sort',
			target: '/client/'
		}, Client)));
});
