// module:
//		app/ctrls/store/StackEdit
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"client/widgets/store/StackEdit"
], function (declare, lang, StackEdit) {
	// summary:
	//		Declare StackEdit widget on application level
	return declare([StackEdit], {
		constructor: function(params) {
			// summary:
			//		Construct view to visualize/edit/create store object
			// params: Object
			//		Contains route parameters:
			//			store: JsonStore
			//			access: access object for the editor
			//			query: additional query parameters

			lang.mixin(this, params);
			// This object works only with application models
			this.access = params.access || {};
			this.back = params.back || false;
			this.authorized = this.access["get"];
			if (!this.query) this.query = {};
		},
		postscript: function () {
			if (!this.store && !params.store) throw new Error("StackEdit requires application model to work with");
			this.inherited(arguments);
		}
	});
});