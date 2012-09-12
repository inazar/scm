// module:
//		app/handlers/index
define([
	"app/nls/translate!",
	"dojo/i18n!app/nls/index",
	"app/config",
	"dojo/topic",
	"client/widgets/layout",
	"app/controllers/error",
	"app/controllers/header",
	"app/controllers/router",
	"dojo/Stateful"
], function (__, nls, config, topic, Layout, ErrorController, HeaderController, RouterController, Stateful) {
	// summary:
	//		create page layout and attach to dom
	var layout = new Layout(), _page = null;
	new HeaderController().placeAt(layout.headerPane);
	new ErrorController().placeAt(layout.statusPane);
	new RouterController().placeAt(layout.controlPane);
	layout.placeAt("appLayout");
	layout.startup();
	topic.subscribe('page/clear', function () {
		if (_page) _page.destroyRecursive();
		_page = null;
	});
	topic.subscribe('page/render', function (page, path) {
		if (_page) _page.destroyRecursive();
		_page = page;
		layout.contentPane.set('content', page);
	});
});