// module:
//		app/models/client/supplier
define([
	"app/models/client",
	"app/models/extend"
], function (Client, Extend) {
	// summary:
	//		define JsonStore for client/supplier based on client store

	return new Extend(Client, 'supplier');
});
