// module:
//		client/widgets/store/StackEdit
define([
	"app/ctrls/translate!grid",
	"dojo/_base/declare",
	"dojo/text!client/views/store/StackEdit.html",
	"dojo/text!client/views/Unauthorized.html",
	"app/models/extend",
	"app/ctrls/store/GridEdit",
	"dojox/mvc/Templated",
	"dijit/form/Button",
	"dijit/layout/StackContainer"
], function(__, declare, template, unauthorized, extend, GridEdit, Templated, Btn) {
	return declare([GridEdit], {
		templateString: template,
		startup: function() {
			if (!this.authorized) return this.inherited(arguments);
			var self = this;
			this.on('flip', function(evt) {
				var content;
				if (evt.page === 'main') {
					self.stackFlip.destroyDescendants();
					self.stackFlip.set('content', '');
					self.stack.selectChild(self.stackMain, true);
				} else {
					var page = evt.page, obj = self.store.pages[page];
					content = new obj.controller({
						store: extend({post: page+'/'+(obj.controller._id ? '' : evt.id+'/')}, self.store),
						access: self.access[page],
						rowid: evt.id,
						query: obj.query || {},
						back: true
					});
					content.startup();
					self.stackFlip.set('content', content);
					self.stack.selectChild(self.stackFlip, true);
				}
				evt.stopPropagation();
			});
			this.inherited(arguments);
		}
	});
});
