// module:
//		client/widgets/user
define([
	"dojo/_base/declare",
	"app/config",
	"dojo/_base/config",
	// template
	"dojo/text!client/views/root.html",
	// declare templated widget
	"dojox/mvc/Templated"
], function (declare, config, dojoConfig, template, Templated) {
	return declare([Templated], {
		templateString: template
	});
});
