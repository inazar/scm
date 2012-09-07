// module:
//		app/handlers/index
define([
	"app/nls/translate!",
	"dojo/i18n!app/nls/index",
	"app/config",
	"client/widgets/layout",
	"app/controllers/error",
	"app/controllers/header",
	"dojo/Stateful"
], function (__, nls, config, Layout, ErrorController, HeaderController, Stateful) {
	// summary:
	//		create page layout and attach to dom
	var layout = new Layout();
	new HeaderController().placeAt(layout.headerPane);
	new ErrorController().placeAt(layout.statusPane);
	layout.placeAt("appLayout");
	layout.startup();
	return layout;
});