// module:
//		client/widgets/store/Edit

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/topic",
	"dojo/when",
	// template
	"dojo/text!client/views/store/Edit.html",
	"dojo/text!client/views/Unauthorized.html",
	// declare templated widget
	"dojox/mvc/Templated",
	"dojox/mvc/_Container",
	"app/ctrls/mvc/Output",
	"dojox/mvc/at",
	"dijit/form/Button",
	"dijit/layout/BorderContainer",
	"dijit/layout/ContentPane"
], function (declare, lang, topic, when, template, unauthorized, Templated, Container, Output, at, Btn) {
	// summary:
	//		Manage user profile
	return declare([Templated], {
		constructor: function () {
			this._buttons = {};
			this._widgets = {};
			this.templateString = template;
		},
		postscript: function () {
			if (!this.access["get"]) this.templateString = unauthorized;
			if (!this._id) {
				this.templateString = "<div></div>";
				topic.publish("status/error", {message: "Cannot identify the row to edit"});
			}
			this.inherited(arguments);
		},
		startup: function () {
			var self = this, args = arguments;

			// run trough the fields definitions and place each field in the table potentially with editor
			var html = '<table>';
			this.store.columns.forEach(function (field) {
				html += '<tr><td>'+field.label+'</td><td id="edit_'+self._id+'_'+field.field+'"></td></tr>';
			});
			html += "</table>";

			this.view.innerHTML = html;
			var container = this._container = new Container({control: this.control}, this.view);
			container._createBody();
			this.store.columns.forEach(function (field) {
				var widget = field.editor ? new field.editor(field.editorArgs) : new Output({ content: "${this.value}" });
				widget.set(widget.checked === undefined ? 'value' : 'checked', at(self.control, field.field));
				widget.placeAt("edit_"+self._id+"_"+field.field).startup();
				container._containedWidgets.push(widget);
				self._widgets[field.field] = widget;
			});

			function _saveButton () {
				if (!self._buttons['save']) {
					self._buttons['save'] = new Btn({
						title: "Save",
						disabled: true,
						'class': "controlButton",
						label: '<div class="sprite16 saveSprite"></div>',
						onClick: function () {
							when(self.putStore()).then(function() {
								_setButtons(true, true);
								topic.publish("status/ok", "Record saved");
							});
						}
					});
					self._buttons['save'].startup();
					self.buttons.addChild(self._buttons['save']);
				}
			}

			var _watch = true;
			function _revertButton () {
				if (!self._buttons['revert']) {
					self._buttons['revert'] = new Btn({
						title: "Revert",
						disabled: true,
						'class': "controlButton",
						label: '<div class="sprite16 refreshSprite"></div>',
						onClick: function () {
							_watch = false;
							when(self.getStore()).then(function() {
								_watch = true;
								_setButtons(true, true);
								topic.publish("status/ok", "Record reverted");
							});
						}
					});
					self._buttons['revert'].startup();
					self.buttons.addChild(self._buttons['revert']);
				}
			}

			function _setButtons (save, revert) {
				if (typeof save === "boolean" && self._buttons['save']) self._buttons['save'].set('disabled', save);
				if (typeof revert === "boolean" && self._buttons['revert']) self._buttons['revert'].set('disabled', revert);
			}

			when(this._load, function () {
				_saveButton();
				_revertButton();
				self.inherited(args);
				self.control.watch(function (name) {
					if (_watch) {
						_setButtons(self._widgets[name].validate ? !self._widgets[name].validate() : false, false);
					}
				});
			});
		},
		uninitialize: function () {
			if (this._container) this._container._destroyBody();
			this.inherited(arguments);
		}
	});
});