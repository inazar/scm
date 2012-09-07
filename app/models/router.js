// module:
//		app/models/router
define([
	"dojo/store/JsonRest",
	"dojo/store/Observable"
], function (JsonRest, Observable) {
	// summary:
	//		define JsonStore for router tree

	return Observable(new JsonRest({
		target: '/routes',
		idProperty: 'hash',
		getChildren: function (parentItem) {
			// summary:
			//		Returns array of child items of given parent item.
			// parentItem:
			//		Item from the dojo/store
			return this.get(parentItem.hash || '/');
		}
	}));
});
