// module:
//		app/models/client
define([
	"dojo/store/JsonRest",
	"dojo/store/Observable"
], function (JsonRest, Observable, getStateful) {
	// summary:
	//		define JsonStore for client

	return Observable(new JsonRest({
		_template: {
			name: {		// Client's name
				placeholder: "Enter client's name",
				required: true
			}
		},
		target: '/client/',
		idProperty: 'id',
		sortParam: 'sort'
	}));
});
