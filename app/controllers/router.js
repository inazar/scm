// module:
//		app/controllers/router
define([
	"app/nls/translate!routes",
	"app/config",
	"require",
	"dojo/_base/declare",
	"dojo/when",
	"dojo/_base/lang",
	"dojo/topic",
	"dojo/router",
	"dijit/tree/ObjectStoreModel",
	"app/models/router",
	"client/widgets/router"
], function (__, config, require, declare, when, lang, topic, router, ObjectStoreModel, routerStore, RouterWidget) {
	return declare([RouterWidget], {
		constructor: function () {
			var self = this;
			this.inherited(arguments);
			if (!this.select) this.select = function () { return false; };
			this.model = new ObjectStoreModel({
				root: { name: 'root', hash: '/', children: true },
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
		},
		startup: function () {
			var self = this, _access = {};
			this.inherited(arguments);
			// register routes
			for (var route in config.routes) {
				(function(route, controller) {
					router.register(route, function(evt) {
						require(["app/controllers/"+controller], function (Page) {
							topic.publish('page/clear');
							when(self.select(evt.newPath), function () {
								var access = {};
								if (_access[evt.newPath]) {
									access = _access[evt.newPath];
									delete _access[evt.newPath]
								}
								topic.publish('page/render', new Page(evt.params, access));
							});
						});
					});
				})(route, config.routes[route]);
			}
			// listen to events - fired by widget
			topic.subscribe('router/go', function(item) {
				_access[item.hash] = item.access;
				router.go(item.hash);
			});
			router.startup();
		}
	});
});
