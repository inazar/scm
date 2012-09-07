// module:
//		app/controllers/router
define([
	"app/nls/translate!routes",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/router",
	"dijit/tree/ObjectStoreModel",
	"app/models/router",
	"client/widgets/router"
], function (__, declare, lang, router, ObjectStoreModel, routerStore, RouterWidget) {
	return declare([RouterWidget], {
		constructor: function () {
			var self = this;
			this.inherited(arguments);
			this.model = new ObjectStoreModel({
				root: { children: true },
				store: routerStore,
				mayHaveChildren: function(item){
					// summary:
					//		Tells if an item has or may have children.  Implementing logic here
					//		avoids showing +/- expando icon for nodes that we know don't have children.
					//		(For efficiency reasons we may not want to check if an element actually
					//		has children until user clicks the expando node).
					// item: Object
					//		Item from the dojo/store
					return item.children;
				}
			});
		}
	});
});
