// module:
//		app/models/client
define([
	"app/config",
	"dojo/cookie",
	"dojo/_base/lang",
	"client/models/client",
	"dojo/store/JsonRest",
	"dojo/store/Observable"
], function (config, cookie, lang, Client, JsonRest, Observable) {
	// summary:
	//		define JsonStore for client

	return Observable(new JsonRest(lang.mixin({
			target: '/client/',
			idProperty: '_id',
			sortParam: 'sort',
			headers: { "X-CSRF-Token": cookie(config.csrf) }
		}, Client)));
});
