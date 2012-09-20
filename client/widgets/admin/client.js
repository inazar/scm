// module:
//		client/widgets/admin/client
define([
	"dojo/_base/declare",
	"app/config",
	"dojo/_base/config",
	// templates
	"dojo/text!client/views/admin/client/create.html",
	"dojo/text!client/views/admin/client/view.html",
	"dojo/text!client/views/admin/client/edit.html",
	// declare templated widget
	"app/ctrls/mvc/Templated",
	// preload dependencies for template
	"app/models/client",
	"dijit/form/Button",
	"dijit/form/TextBox",
	"dojox/mvc/EditStoreRefController"
], function (declare, config, dojoConfig, createTemplate, viewTemplate, editTemplate, Templated) {
	// summary:
	//		Generate view to create new client
	return declare([Templated], {
		constructor: function() {
			this.templates.view = viewTemplate;
			this.templates.edit = editTemplate;
			this.templates.create = createTemplate;
		}
	});
});