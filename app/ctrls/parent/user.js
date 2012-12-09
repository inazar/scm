// module:
//		app/ctrls/client/user
define([
	"dojo/_base/declare",
	"app/ctrls/store/GridEdit",
	"app/models/user",
	"app/models/extend"
], function (declare, User, userStore, extend) {
	// summary:
	//		Declare client admin page

	return declare([User], {
		constructor: function(o) {
			this.store = extend({pre: '/parent/'+o.params.role+'/'+o.params.pid}, userStore);
		}
	});
});
