// module:
//		app/controllers/admin
define([
	"app/nls/translate!admin",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/on",
	"dojo/when",
	"dojo/topic",
	"dojox/mvc/StoreRefController",
	"client/widgets/admin/user",
	"app/models/user",
	"app/controllers/error"
], function (__, declare, lang, on, when, topic, StoreRefController, User, userStore, error) {
	// summary:
	//		Declare client admin page
	return declare([User], {
		_idProperty: 'userId',
		access: {},
		userId: null,
		clientId: null,
		constructor: function(params, access) {
			// summary:
			//		Construct view to either create new client or edit existing
			//		If widget is used to edit client, its model is equal to app/models/client, otherwise 
			//		model is Stateful object taken from app/models/client property 'model'
			// params: Object
			//		Contains route parameters, cid: customer id, uid: user id
			// access: Object
			//		Object defining the access rights for current user
			if (access) this.access = access;
			var model;
			if (params.uid || this.userId) {
				// we edit user
				if (params.uid) this.userId = params.uid;
				if (params.cid) this.clientId = params.cid;
				model = userStore;
			} else {
				// we create new user
				model = userStore.getStateful();
			}
			this.control = new StoreRefController({ store: model });
		},
		postCreate: function() {
			var self = this, control = this.control;
			if (this.userId) this.control.getStore(this.userId);
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
							when(control.putStore(control[control._refSourceModelProp], function() {
								error.ok(__("Record saved"));
							}));
						} else {
							when(userStore.add(control[control._refSourceModelProp]), function() {
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