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
		_createTree: function () {
			this._tree = new Tree({
				showRoot: false,
				model: this.model,
				onClick: function (item, node) {
					if (!item.access) {
						if (node.isExpanded) this._collapseNode(node);
						else this._expandNode(node);
					} else topic.publish('router/go', item);
				}
			}).placeAt(this.tree);
		},
		postCreate: function () {
			this.inherited(arguments);
			this._createTree();
		},
		select: function(hash) {
			var path = ['/'], prefix = '';
			hash.split('/').forEach(function(p) {
				prefix = (prefix !== '/' ? prefix : '') + '/' + p;
				if (p && p !== "parent") path.push(prefix);
			});
			return this._tree.set('paths', [path]);
		},
		refresh: function () {
			var paths = this._tree.get("paths");
			this._tree.destroyRecursive();
			this.model.destroy();
			this._createModel();
			this._createTree();
			this._tree.set("paths", paths);
		}
	});
});
