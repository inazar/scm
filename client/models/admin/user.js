// module:
//		client/models/admin/user
define([
	"app/ctrls/translate!user",
	"app/ctrls/store/Edit",
	"app/ctrls/store/GridEdit",
	"dijit/form/ValidationTextBox",
	"dijit/form/CheckBox",
	"client/widgets/grid/button",
	"dojox/validate/web"
], function (__, Edit, GridEdit, ValidationTextBox, CheckBox, button, validate) {
	// summary:
	//		define client specific parameters for store
	return {
		columns: [
			{
				field: 'name',
				label: __('Name'),
				editor: ValidationTextBox,
				editOn: 'dblclick',
				editorArgs: {
					required: true
				}
			},
			{
				field: 'email',
				label: __('e-mail'),
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
				label: __('Blocked'),
				editor: CheckBox
			},
			{
				field: 'root',
				label: __('Admin'),
				editor: CheckBox
			},
			{
				field: 'failures',
				label: __('Failures')
			},
			button({
				title: __('Clients'),
				label: '<div class="sprite16 paperclipSprite"/>',
				onClick: function () {
					this.emit('flip', {page: 'client', id: this.objectId});
				}
			}),
			button({
				title: __('Access'),
				label: '<div class="sprite16 lockSprite"/>',
				onClick: function () {
					this.emit('flip', {page: 'access', id: this.objectId});
				}
			})
		],
		pages: {
			'client': {
				controller: GridEdit,
				columns: []
			},
			'access': {
				controller: Edit,
				columns: []
			}
		}
	};
});
