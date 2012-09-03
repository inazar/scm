// module:
//		client/widgets/error

define([
	"dojo/_base/declare",
	"dojo/dom-class",
	// template
	"dojo/text!client/views/error.html",
	// declare templated widget
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin"
], function (declare, domClass, template, _WidgetBase, _TemplatedMixin) {
	// summary:
	//	This widget creates visual presentation for error messages

	var classes = ['statusOk', 'statusWarning', 'statusError', 'statusLoading'];

	function status (node, cls, obj) {
		domClass.replace(node.icon, cls, classes.filter(function (c) { return c !== cls; }));
		node.errorName.innerHTML = obj.name !== undefined ? obj.name : (cls === 'statusError' ? 'Error' : 'Warning');
		node.message.innerHTML = obj.message !== undefined ? obj.message : 'unknown';
		node.info.innerHTML = obj.info ? '(' + obj.info + ')' : '';
	}
	return declare([_WidgetBase, _TemplatedMixin], {
		templateString: template,
		filter: function (obj) { return obj; },
		ok: function () { status(this, 'statusOk', { name:'', message:'' }); },
		error: function (error /* Object */) { status(this, 'statusError', this.filter(error)); },
		warning: function (warning /* Object */) { status(this, 'statusWraning', this.filter(error)); },
		loader: function (start /* Boolean */) { status(this, start ? 'statusLoading' : '', { name:'', message:'' }); }
	});
});