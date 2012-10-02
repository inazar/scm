// module:
//		client/widgets/router
define([
	"dojo/_base/declare",
	"app/config",
	"dojo/_base/config",
	"dojo/topic",
	// template
	"dojo/text!client/views/router.html",
	"dijit/form/Button",
	// declare templated widget
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	// preload dependencies for template
	"dijit/Tree"
], function (declare, config, dojoConfig, topic, template, Button, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Tree) {
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		templateString: template,
		postCreate: function () {
			this.inherited(arguments);
			this._tree = new Tree({
				showRoot: false,
				model: this.model,
				onClick: function (item, node) {
					if (!item.access) {
						if (node.isExpanded) this._collapseNode(node);
						else this._expandNode(node);
					} else topic.publish('router/go', item);
				}
			}, this.tree);
		},
		select: function(hash) {
			var path = [], prefix = '';
			hash.split('/').forEach(function(p) {
				path.push(prefix = (prefix !== '/' ? prefix : '') + '/' + p);
			});
			return this._tree.set('paths', [path]);
		}
	});
});
