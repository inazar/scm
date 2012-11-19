// module:
//		app/models/client/vendor
define([
	"app/models/client",
	"app/models/extend"
], function (Client, Extend) {
	// summary:
	//		define JsonStore for client/vendor based on client store

	return new Extend(Client, 'vendor');
});
