// module:
//		client/widgets/router
define([
	"dojo/_base/declare",
	"app/config",
	"dojo/_base/config",
	// template
	"dojo/text!client/views/router.html",
	"dijit/form/Button",
	// declare templated widget
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	// preload dependencies for template
	"dijit/Tree"
], function (declare, config, dojoConfig, template, Button, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Tree) {
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		templateString: template,
		postCreate: function () {
			this.inherited(arguments);
			new Tree({
				showRoot: false,
				'class': 'routerTree',
				model: this.model
			}, this.tree);
		}
	});
});
