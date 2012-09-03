// module:
//		client/controllers/login

define([
	"dojo/_base/declare",
	"dojo/window",
	"dojo/dom-geometry",
	// template
	"dojo/text!client/views/register.html",
	// declare templated widget
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	// preload dependencies for template
	"dijit/form/Form",
	"dijit/form/ValidationTextBox",
	"dijit/form/MappedTextBox",
	"dijit/form/Button",
	'xstyle/css!../css/style.css'
], function (declare, win, geometry, template, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin) {
	// summary:
	//		Manage login process
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		templateString: template,
		place: function() {
			var viewport = win.getBox(this.ownerDocument);
				box = geometry.position(this.wrapper);
			this.wrapper.style["margin-top"] = Math.floor((viewport.h - box.h) / 2)+"px";
		}
	});
});
