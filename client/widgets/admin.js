// module:
//		client/widgets/user
define([
	"dojo/_base/declare",
	"app/config",
	"dojo/_base/config",
	// template
	"dojo/text!client/views/admin.html",
	// declare templated widget
	"dojox/mvc/Templated",
	// preload dependencies for template
	"app/models/client",
	"dijit/form/Button",
	"dijit/form/TextBox",
	"dojox/mvc/EditStoreRefController"
], function (declare, config, dojoConfig, template, Templated) {
	return declare([Templated], {
		templateString: template
	});
});
