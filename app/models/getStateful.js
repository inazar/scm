define([
	"dojox/mvc/getStateful"
], function (getStateful) {
	return function() {
		var model = {};
		for (var field in this._template) model[field] = undefined;
		return getStateful(model);
	};
});
