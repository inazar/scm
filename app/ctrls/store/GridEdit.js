// module:
//		app/ctrls/store/GridEdit
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"client/widgets/store/GridEdit"
], function (declare, lang, GridEdit) {
	// summary:
	//		Declare GridEdit widget on application level
	return declare([GridEdit], {
		constructor: function(params) {
			// summary:
			//		Construct view to visualize/edit/create store object
			// params: Object
			//		Contains route parameters:
			//			store: JsonStore
			//			access: access object for the editor
			//			query: additional query parameters

			// This object works only with application models
			this.access = params.access || {};
			this.authorized = this.access["get"];
			if (!this.query) this.query = {};
		},
		postscript: function () {
			if (!this.store && !params.store) throw new Error("GridEdit requires application model to work with");
			this.inherited(arguments);
		}
	});
});