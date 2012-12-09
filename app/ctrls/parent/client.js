// module:
//		app/ctrls/client/client
define([
	"dojo/_base/declare",
	"app/ctrls/store/GridEdit",
	"app/models/client",
	"app/models/extend"
], function (declare, Client, clientStore, extend) {
	// summary:
	//		Declare client admin page

	return declare([Client], {
		constructor: function(o) {
			this.store = extend({pre: '/parent/'+o.params.role+'/'+o.params.pid}, clientStore);
		}
	});
});
