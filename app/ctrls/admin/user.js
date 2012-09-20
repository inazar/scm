// module:
//		app/ctrls/admin/user
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
	"client/widgets/admin/user",
	"app/models/user",
	"app/ctrls/error"
], function (__, nls, declare, lang, on, when, topic, StoreRefController, Observable, User, userStore, error) {
	// summary:
	//		Declare client admin page
	return declare([User], {
		_idProperty: 'userId',
		nls: nls,
		access: {},
		userId: null,
		clientId: null,
		constructor: function(params, access) {
			// summary:
			//		Construct view to either create new user or edit existing
			//		If widget is used to edit user, its model is equal to app/models/user, otherwise 
			//		model is Stateful object taken from app/models/user property 'model'
			// params: Object
			//		Contains route parameters, uid: user id
			// access: Object
			//		Object defining the access rights for current user
			if (access) this.access = access;

			this.control = new StoreRefController({ store: userStore });

			if (params.uid || this.userId) {
				// we edit user
				if (params.uid) this.userId = params.uid;
				if (params.cid) this.clientId = params.cid;
			} else {
				this.control.model = Observable({});
			}
		},
		postCreate: function() {
			var self = this, control = this.control;
			if (this.userId && this.access["get"]) control.getStore(this.userId);
			if (this.resetButton) {
				on(this.resetButton, 'click', function () {
					if (self.userId) control.getStore(self.userId);
					else control.set('store', userStore.getStateful());
				});
			}
			if (this.form) {
				on(this.form.domNode, 'submit', function (e) {
					e.preventDefault();
					if (self.form.validate()) {
						if (self.userId) {
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