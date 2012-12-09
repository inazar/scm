// module:
//		app/controlers/Output
define([
	"app/ctrls/translate!",
	"dojo/_base/declare",
	"dojox/mvc/Output"
], function (__, declare, Output) {
	return declare([Output], {
		set: function(name, value) {
			if (typeof value === "boolean") value = value ? __('yes') : __('no');
			this.inherited(arguments, [name, value]);
		}
	});
});
