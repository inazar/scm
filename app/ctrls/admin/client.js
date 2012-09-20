// module:
//		app/ctrls/admin/client
define([
	"app/ctrls/translate!admin",
	"dojo/i18n!app/nls/admin",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/on",
	"dojo/when",
	"dojo/topic",
	"dojox/mvc/StoreRefController",
	"dojo/store/Observable",
	"client/widgets/admin/client",
	"app/models/client",
	"app/ctrls/error"
], function (__, nls, declare, lang, on, when, topic, StoreRefController, Observable, Client, clientStore, error) {
	// summary:
	//		Declare client admin page
	return declare([Client], {
		_idProperty: 'clientId',
		nls: nls,
		access: {},
		userId: null,
		clientId: null,
		constructor: function(params, access) {
			// summary:
			//		Construct view to either create new client or edit existing
			//		If widget is used to edit client, its model is equal to app/models/client, otherwise 
			//		model is Stateful object taken from app/models/client property 'model'
			// params: Object
			//		Contains route parameters, cid: customer id
			// access: Object
			//		Object defining the access rights for current user
			if (access) this.access = access;

			this.control = new StoreRefController({ store: clientStore });

			if (params.cid || this.clientId) {
				// we edit client
				if (params.uid) this.userId = params.uid;
				if (params.cid) this.clientId = params.cid;
			} else {
				this.control.model = Observable({});
			}
		},
		postCreate: function() {
			var self = this, control = this.control;
			if (this.clientId && this.access["get"]) control.getStore(this.clientId);
			if (this.resetButton) {
				on(this.resetButton, 'click', function () {
					if (self.clientId) control.getStore(self.clientId);
					else control.set('store', clientStore.getStateful());
				});
			}
			if (this.form) {
				on(this.form.domNode, 'submit', function (e) {
					e.preventDefault();
					if (self.form.validate()) {
						if (self.clientId) {
							when(control.putStore(control[control._refSourceModelProp]), function() {
								error.ok(__("Record saved"));
							});
						} else {
							when(control.addStore(control[control._refSourceModelProp]), function() {
		//							topic.publish('router/go');
							});
						}
					}
				});
			}
			this.inherited(arguments);
		}
	});
});