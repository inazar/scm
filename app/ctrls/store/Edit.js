// module:
//		app/ctrls/store/Edit
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"client/widgets/store/Edit",
	"dojox/mvc/StoreRefController",
	"dojox/mvc/getStateful"
], function (declare, lang, Edit, StoreRefController, getStateful) {
	// summary:
	//		Declare StoreEdit widget on application level
	return declare([Edit], {
		_id: null,
		constructor: function(params) {
			// summary:
			//		Construct view to visualize/edit store object
			// params: Object
			//		Contains route parameters:
			//			store: JsonStore
			//			access: access object for the editor
			//			rowid: The id of row to edit
			//			query: additional query parameters

			// This object works only with application models
			if (!this.store && !params.store) throw new Error("StoreEdit requires application model to work with");
			this.params = params.params || null;
			this.access = params.access || {};
			this.query = params.query || null;
			this.idParam = null;
			this.control = null;
		},
		postscript: function () {
			// summary:
			//		By now idParam and params are set so let's define the main id
			//		and move other properties to the query
			if (this.params && this.idParam && this.params[this.idParam]) {
				this._id = this.params[this.idParam];
				this.query = lang.mixin(this.query ? this.query : {}, this.params);
				delete this.query[this.idParam];
			}
			this.control = new StoreRefController({store: this.store});
			this._load = this.control.getStore(this._id);
			this.inherited(arguments);
		},
		queryStore: function(query, options){
			return this.control.queryStore(query, options);
		},
		getStore: function (options) {
			if (this._id) {
				return this.control.getStore(this._id, options);
			} else {
				var result = {};
				this.set(this._refSourceModelProp, getStateful(result, this.getStatefulOptions));
				return result;
			}
		},
		putStore: function(object, options) {
			return this.control[this._id ? "putStore" : "addStore"](this.control[this.control._refSourceModelProp], options);
		},
		removeStore: function (options) {
			return this.control.removeStore(this._id, options);
		}
	});
});