// module:
//		app/controllers/admin
define([
	"app/nls/translate!admin",
	"dojo/_base/declare",
	"client/widgets/admin/client"
	"app/models/client",
], function (__, declare, Client, clientStore) {
	// summary:
	//		Declare client admin page
	return declare([Client], {
		model: null,
		clientId: null,
		constructor: function(id, parentId) {
			// summary:
			//		Construct view to either create new client or edit existing
			//		If widget is used to edit client, its model is equal to app/models/client, otherwise 
			//		model is Stateful object taken from app/models/client property 'model'
			// id: String
			//		The id of client to edit or null to create new one
			// parentId: String
			//		The id of client which creates the new client
			if (id) {
				this.clientId = id;
				this.model = clientStore;
			} else {
				this.model = clientStore.model;
			}
		}
	});
});