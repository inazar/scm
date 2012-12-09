// module:
//		app/models/client/client
define([
	"app/models/client",
	"app/models/extend"
], function (Client, extend) {
	// summary:
	//		define JsonStore for client/client based on client store

	return extend({target: '/parent/', post: 'client/'}, Client);
});
