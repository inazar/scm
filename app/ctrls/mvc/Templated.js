// module:
//		app/controlers/Templated
define([
	"app/ctrls/translate!admin",
	"dojo/_base/declare",
	// template
	"dojo/text!client/views/unathorized.html",
	// declare templated widget
	"dojox/mvc/Templated"
], function (__, declare, template, Templated) {
	return declare([Templated], {
		_idProperty: '__id',
		templates: {
			unathorized: template,
			view: null,
			edit: null,
			create: null
		},
		unathorized: {
			message: __("You are not authorized to view this page")
		},
		postscript: function() {
			var self = this;
			function _getTemplate(name) { return self.templates[name] ? self.templates[name] : self.templates.unathorized; }
			if (this.access["get"]) {
				if (this[this._idProperty]) this.templateString = this.access["put"] ? _getTemplate('edit') : _getTemplate('view');
				else this.templateString = this.access["post"] ? _getTemplate('create') : this.unathorized.template;
			} else this.templateString = this.templates.unathorized;
			this.inherited(arguments);
		}
	});
});
