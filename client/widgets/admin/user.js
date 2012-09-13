// module:
//		client/widgets/admin/user
define([
	"dojo/_base/declare",
	"app/config",
	"dojo/_base/config",
	// templates
	"dojo/text!client/views/admin/user/create.html",
	"dojo/text!client/views/admin/user/view.html",
	"dojo/text!client/views/admin/user/edit.html",
	// declare templated widget
	"app/ctrls/mvc/Templated",
	"app/ctrls/mvc/Output",
	"dojox/mvc/at",
	"dijit/form/Form",
	"dijit/form/Button",
	"dijit/form/ValidationTextBox",
	"dijit/form/CheckBox"
	// preload dependencies for template
], function (declare, config, dojoConfig, createTemplate, viewTemplate, editTemplate, Templated) {
	// summary:
	//		Generate view to edit or create new user
	return declare([Templated], {
		constructor: function() {
			this.templates.view = viewTemplate;
			this.templates.edit = editTemplate;
			this.templates.create = createTemplate;
		}
	});
});