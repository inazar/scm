// module:
//		app/models/profile
define([
	"dijit/form/ValidationTextBox",
	"dijit/form/CheckBox",
	"dojox/validate/web"
], function (ValidationTextBox, CheckBox, validate) {
	// summary:
	//		define client specific parameters for store
	return {
		columns: [
			{
				field: 'name',
				label: 'Name',
				editor: ValidationTextBox,
				editOn: 'dblclick',
				editorArgs: {
					required: true
				}
			},
			{
				field: 'email',
				label: 'e-mail'
			}
		]
	};
});
