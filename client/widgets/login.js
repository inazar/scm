// module:
//		client/controllers/login

define([
	"dojo/_base/declare",
	"dojo/window",
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/_base/config",
	// template
	"dojo/text!client/views/login/head.html",
	"dojo/text!client/views/login/email.html",
	"dojo/text!client/views/login/password.html",
	"dojo/text!client/views/login/confirm.html",
	"dojo/text!client/views/login/reset.html",
	"dojo/text!client/views/login/submit.html",
	// declare templated widget
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	// preload dependencies for template
	"dijit/form/Form",
	"dijit/form/TextBox",
	"dijit/form/ValidationTextBox",
	"dijit/form/MappedTextBox",
	"dijit/form/Button",
	'xstyle/css!../css/style.css'
], function (declare, win, domConstruct, domGeometry, dojoConfig, head, email, password, confirm, reset, submit, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin) {
	// summary:
	//		Manage login process
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		constructor: function () {
			// 1) if root true (does not exists) request only email
			// 2) if email set request password and confirmation
			// 3) otherwise show normal login window
			var tpl = head;
			if (dojoConfig.root) tpl += email+submit;
			else if (dojoConfig.email) {
				tpl +=	'<input data-dojo-type="dijit/form/TextBox" type="hidden" name="email" value="'+dojoConfig.email+'" />'+
						'<input data-dojo-type="dijit/form/TextBox" type="hidden" name="code" value="'+dojoConfig.code+'" />'+
						password+confirm+submit;
			} else tpl += email+password+(this.dialog ? submit : reset);
			this.templateString = tpl;
		},
		startup: function () {
			this.inherited(arguments);
			var field = this.email || this.password;
			setTimeout(function () { field.focus(); }, 100);
		},
		place: function() {
			var viewport = win.getBox(this.ownerDocument);
				box = domGeometry.position(this.wrapper);
			this.wrapper.style["margin-top"] = Math.floor((viewport.h - box.h) / 2)+"px";
		}
	});
});
