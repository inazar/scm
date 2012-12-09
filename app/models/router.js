// module:
//		app/models/router
define([
	"app/ctrls/translate!index",
	"dojo/when",
	"dojo/store/JsonRest",
	"dojo/store/Observable"
], function (__, when, JsonRest, Observable) {
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
			return when(this.get(parentItem.hash || '/'), function (children) {
				children.forEach(function(item) {
					if (item.name) item.name = __(item.name);
				});
				return children;
			});
		}
	}));
});
