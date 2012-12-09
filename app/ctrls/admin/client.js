// module:
//		app/ctrls/admin/client
define([
	"dojo/i18n!app/nls/client",
	"dojo/_base/declare",
	"app/ctrls/store/GridEdit",
	"app/models/client"
], function (nls, declare, Client, clientStore) {
	// summary:
	//		Declare vendors page
	return declare([Client], {
		nls: nls,
		store: clientStore
	});
});
