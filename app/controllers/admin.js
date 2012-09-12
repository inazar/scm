// module:
//		app/controllers/admin
define([
	"app/nls/translate!admin",
	"dojo/i18n!app/nls/admin",
	"dojo/_base/declare",
	"client/widgets/admin"
], function (__, nls, declare, Admin) {
	// summary:
	//		Declare admin page
	return declare([Admin], {
		nls: nls,
		constructor: function (params, access) {
			this.access = access;
		}
	});
});