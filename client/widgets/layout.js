// module:
//		client/widgets/layout
define([
	"dojo/_base/declare",
	// template
	"dojo/text!client/views/layout.html",
	// declare templated widget
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	// preload dependencies for template
	"dijit/layout/BorderContainer",
	"dijit/layout/ContentPane",
	'xstyle/css!../css/style.css'
], function (declare, template, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin) {
	// summary:
	//		Create application layout
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		templateString: template,
		postCreate: function () {
			this.inherited(arguments);
		}
	});
});