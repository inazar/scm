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
			if (!this.store && !params.store) throw new Error("GridEdit requires application model to work with");
			this.access = params.access || {};
			if (!this.query) this.query = {};
		},
		postscript: function () {
			this.authorized = this.access["get"];
			this.inherited(arguments);
		}
	});
});