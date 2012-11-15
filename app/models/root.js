// module:
//		app/models/root
define([
	"./user"
], function (userStore) {
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
		idProperty: 'id'
	}));
});
