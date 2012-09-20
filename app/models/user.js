// module:
//		app/models/user
define([
	"dojo/store/JsonRest",
	"dojo/store/Observable"
], function (JsonRest, Observable, getStateful) {
	// summary:
	//		define JsonStore for user

	return Observable(new JsonRest({
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
