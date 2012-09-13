// module:
//		app/controlers/Output
define([
	"app/ctrls/translate!admin",
	"dojo/_base/declare",
	"dojox/mvc/Output"
], function (__, declare, Output) {
	return declare([Output], {
		set: function(name, value) {
			if (typeof value === "boolean") value = value ? 'yes' : 'no';
			this.inherited(arguments, [name, value]);
		}
	});
});
