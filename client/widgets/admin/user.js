// module:
//		client/widgets/admin/user

define([
	"app/ctrls/translate!user",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/topic",
	"dojo/when",
	// template
	"dojo/text!client/views/admin/user.html",
	"dojo/text!client/views/Unauthorized.html",
	// declare templated widget
	"dojox/mvc/Templated",
	"dojox/mvc/_Container",
	"app/ctrls/mvc/Output",
	"dojox/mvc/at",
	"dijit/form/Button",
	"dijit/layout/BorderContainer",
	"dijit/layout/StackContainer",
	"dijit/layout/ContentPane"
], function (__, declare, lang, topic, when, template, unauthorized, Templated, Container, Output, at, Btn) {
	// summary:
	//		Manage user profile
	return declare([Templated], {
		unauthorized: __("You are not authorized to view this page"),
		constructor: function () {
			this.templateString = template;
		},
		postscript: function () {
			if (!this.authorized) this.templateString = unauthorized;
			this.inherited(arguments);
		}
	});
});
