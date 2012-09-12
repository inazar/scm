// module:
//		app/models/client
define([
	"dojo/store/JsonRest",
	"dojo/store/Observable",
	"dojox/mvc/getStateful"
], function (JsonRest, Observable, getStateful) {
	// summary:
	//		define JsonStore for client

	return Observable(new JsonRest({
		model: getStateful({
			name: "Enter client's name",
			secret: undefined
		}),
		target: '/client/',
		idProperty: '_id'
	}));
});
