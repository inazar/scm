// module:
//		app/models/user
define([
	"dojo/store/JsonRest",
	"dojo/store/Observable",
	"dojox/mvc/getStateful"
], function (JsonRest, Observable, getStateful) {
	// summary:
	//		define JsonStore for user

	return Observable(new JsonRest({
		getStateful: function() {
			var model = {};
			for (var field in this._template) model[field] = undefined;
			return getStateful(model);
		},
		_template: {
			email: {	// User's email
				placeholder: "Enter email address",
				required: true
			},
			name: {		// User's name
				placeholder: "Enter user's name",
				required: true
			}
		},
		target: '/user/',
		idProperty: '_id'
	}));
});
