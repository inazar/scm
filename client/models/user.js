// module:
//		app/models/user
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
				label: 'e-mail',
				editor: ValidationTextBox,
				editOn: 'dblclick',
				editorArgs: {
					invalidMessage: "Valid email required",
					missingMessage: "email cannot be empty",
					required: true,
					validator: validate.isEmailAddress
				}
			},
			{
				field: 'blocked',
				label: 'Blocked',
				editor: CheckBox
			},
			{
				field: 'failures',
				label: 'Failures'
			}
		]
	};
});
