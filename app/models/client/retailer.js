// module:
//		app/models/client/retailer
define([
	"app/models/client",
	"app/models/extend"
], function (Client, Extend) {
	// summary:
	//		define JsonStore for client/retailer based on client store

	return new Extend(Client, 'retailer');
});
