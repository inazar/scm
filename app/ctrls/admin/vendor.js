// module:
//		app/ctrls/admin/vendor
define([
	"dojo/_base/declare",
	"client/widgets/admin/vendor",
	"app/models/client/vendor"
], function (declare, Vendor, clientStore) {
	// summary:
	//		Declare client admin page
	return declare([Vendor], {
		store: clientStore,
		query: {"role.vendor": true}
	});
});
