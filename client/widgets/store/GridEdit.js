// module:
//		client/widgets/store/GridEdit
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/Stateful",
	"dojo/Deferred",
	"dojo/when",
	"dojo/on",
	"dojo/aspect",
	"dojo/topic",
	"dojo/query",
	"put-selector/put",
	"dijit/registry",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!client/views/store/GridEdit.html",
	"dojo/text!client/views/Unauthorized.html",
	"dgrid/OnDemandGrid",
	"dgrid/Selection",
	"dgrid/Keyboard",
	"dgrid/editor",
	"client/widgets/grid/button",
	"dijit/form/Button",
	"dijit/layout/BorderContainer",
	"dijit/layout/ContentPane"
], function(declare, lang, Stateful, Deferred, when, on, aspect, topic, query, put, registry, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, unauthorized, OnDemandGrid, Selection, Keyboard, editor, button, Btn) {
	var storeGrid = declare([OnDemandGrid, Selection, Keyboard], {
		selectionMode: "single"
	});
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		constructor: function () {
			this._buttons = {};
			this.templateString = template;
		},
		postscript: function () {
			if (!this.authorized) this.templateString = unauthorized;
			this.inherited(arguments);
		},
		startup: function() {
			if (!this.authorized) return this.inherited(arguments);

			var self = this;

			var _actions = {
				"add": {},
				"delete": {}
			};

			var _state = new Stateful({
				valid: true,
				modified: false
			});

			function _checkModified() {
				_state.set("modified", Object.keys(_actions["add"]).length || Object.keys(_actions["delete"]).length || Object.keys(grid.dirty).length);
			}

			var _staticValidators = {};
			var _dynamicValidators = {};
			var _validators = {};			// validators for new elements per row
			var _staticWidgets = {};		// "always edit" widgets per row

			var _queryColumns = [];			// columns to render query
			var _newColumns = [];		// columns to render new row
			// fields to copy to new row columns
			var _list = ['field', 'label', 'className', 'get', 'sortable', 'formatter', 'renderCell', 'renderHeaderCell'];

			var _idProperty = self.store.idProperty;
			var i, k, c, col = this.store.columns;

			// attach onBlur to widgets and inputs in regular row
			function _onBlur(e) {
				aspect.after(e, "init", function () {
					if (e.editorInstance && typeof e.editorInstance.validate === "function" && e.editorInstance.on) {
						// this is hidden edit activated on mouse or touch event
						var _oldBlur = e.editorInstance.onBlur;
						e.editorInstance.onBlur = function (evt) {
							// validate widget
							if (e.editorInstance.validate()) {
								// remove validator from list
								_state.set("valid", true);
								delete _dynamicValidators[e.objectId][e.field];
								if (!Object.keys(_dynamicValidators[e.objectId]).length) delete _dynamicValidators[e.objectId];
							} else {
								// lock closing of the widget if it is not valid
								_state.set("valid", false);
								e._editorBlurHandle.pause();
								setTimeout(function() {
									e.editorInstance.focus();
								}, 10);
							}
							// just in case other blur events defined
							_oldBlur.apply(this, arguments);
						};
						// reset standard blur handle for future blurs
						on(e.editorInstance, 'blur', function () {
							e._editorBlurHandle.resume();
						});
					}
				});
				// remember original renderCell method
				var _renderCell = e.renderCell;
				// and replace renderCell with modified version
				e.renderCell = function (object, value, cell, options){
					// determine where properties live
					var node = cell.tagName == "TD" ? cell : cell.parentNode;
					// render the cess with original method
					_renderCell.apply(this, arguments);
					// inititate cell edit widget only if all data is avalid and lock other rows
					if (e._editOn) {
						on(node, e._editOn, function(evt){
							if (_state.get("valid")) {
								// remember validator for current cell
								if (!_dynamicValidators[object[_idProperty]]) _dynamicValidators[object[_idProperty]] = {};
								_dynamicValidators[object[_idProperty]][e.field] = lang.hitch(e.editorInstance, "validate");
								// remember object id
								e.objectId = object[_idProperty];
								on.emit(node, 'cell/edit', evt);
							}
						});
					}
					// collect the list of row widgets to disable/enable it when needed
					if (!(node.widget && node.widget.readOnly) && !(node.input && node.input.disabled)) {
						node._widget = node.widget || node.input;
					}
					// consider that cell is always edited need to take necessary actions when it is blured
					var widget = cell[typeof e.editor != "string" ? "widget" : "input"];
					if (widget) {
						// cell has always visible editor
						if (widget.validate) {
							// remember validator
							if (!_staticValidators[object[_idProperty]]) _staticValidators[object[_idProperty]] = [];
							_staticValidators[object[_idProperty]].push(lang.hitch(widget, "validate"));
						}
						// is "always on" input/widget is blured check valid status
						on(widget, "blur", function() {
							if (widget.validate && !widget.validate()) {
								_state.set("valid", false);
								setTimeout(function () { widget.focus(); }, 10);
							} else _state.set("valid", true);
						});
					}
				};
				return e;
			}

			// calculate columns
			if (this.access["put"]) {
				// declare grid with editors
				for (i=0; i<col.length; i++) {
					c = lang.mixin({}, col[i]);
					if (c.editor) {
						if (c.editOn && !c._editOn) {
							c._editOn = c.editOn;
							c.editOn = 'cell/edit';
						}
						_queryColumns.push(_onBlur(editor(c)));
					} else _queryColumns.push(c);
				}
			} else {
				// declare simple cells
				for (i=0; i<col.length; i++) {
					c = {};
					for (k=0; k<list.length; k++) {
						if (col[i][list[k]] !== undefined) c[list[k]] = col[i][list[k]];
					}
					columns.push(c);
				}
			}

			// add delete buttons to regular rows
			if (this.access['delete']) {
				_queryColumns.push(button({
					label: '<div class="sprite16 deleteSprite"/>',
					title: 'delete',
					'class': 'controlButton',
					field: 'controlButton',
					sortable: false,
					onClick: function () {
						if (this.objectId) {
							_actions["delete"][this.objectId] = !_actions["delete"][this.objectId];
							put(grid.row(this.objectId).element, (_actions["delete"][this.objectId] ? '.' : '!' )+'dgrid-deleted');
							_checkModified();
						}
					}
				}));
			} else {
				_queryColumns.push(button({
					hidden: true,
					'class': 'controlButton',
					field: 'controlButton',
					sortable: false
				}));
			}

			// the main grid to show on the page
			var grid = this._grid = new storeGrid({
				store: this.store,
				columns: _queryColumns,
				query: this.query
			});
			this.grid.set('content', grid);
			grid.startup();
			// perform necessary modifications on the row
			aspect.after(grid, "renderRow", function (row, args) {
				var id = args[0][_idProperty];
				if (id === undefined) put(row, '.dgrid-newrow');
				if (_actions["delete"][id]) put(row, '.dgrid-deleted');
				if (grid.dirty[id]) put(row, '.dgrid-modified');
				return row;
			});
			// watch the revert action
			aspect.after(grid, "revert", function (res) {
				when(res, function () {
					_state.set("valid", true);
					_state.set("modified", false);
					_actions["add"] = {};
					_actions["delete"] = {};
					_validators = {};
				});
				return res;
			});
			// make sure dirty is linked with _actions.add
			aspect.before(grid, "updateDirty", function(id, field, value){
				if (id.substr(0, 3) === "new" && !grid.dirty[id]) {
					grid.dirty[id] = _actions.add[id] = _actions.add[id] || {};
				}
			});

			// summary:
			//		Place add button in control area
			//		When add button is clicked all other rows must be saved and validated.
			var _idCounter = 0;
			function _addButton () {
				if (!self._buttons['add']) {
					self._buttons['add'] = new Btn({
						title: "Add",
						'class': "controlButton",
						label: '<div class="sprite16 addSprite"></div>',
						onClick: function () {
							var newId = "new_"+_idCounter++, obj = {}; obj[_idProperty] = newId;
							var row = grid.newRow(lang.delegate(lang.mixin({}, self.query), obj), null, 0, {subRows: [_newColumns]});
						}
					});
					self._buttons['add'].startup();
					self.buttons.addChild(self._buttons['add']);
				}
			}

			// summary:
			//		Place save button in control area
			function _saveButton () {
				if (!self._buttons['save']) {
					self._buttons['save'] = new Btn({
						title: "Save",
						disabled: true,
						'class': "controlButton",
						label: '<div class="sprite16 saveSprite"></div>',
						onClick: function () {
							var id, i, v;
							for (id in _validators) {
								v = _validators[id];
								for (i=0; i<v.length; i++) {
									if (!v[i]()) {
										// _state.set("valid", false);
										return;
									}
								}

							}
							// now we have all results valid
							// _state.set("valid", true);

							// first add new rows - see _StoreMixin.save()
							var d = new Deferred(), promise = d.promise, store = grid.store, self = grid;

							// produce template for given id
							function getTemplate (id) {
								return function(){ return lang.mixin({}, self.query); }; // TODO!
							}

							// function called within loop to generate a function for putting an item
							function adder(id, dirtyObj) {
								// Return a function handler
								return function(object) {
									var colsWithSet = self._columnsWithSet,
										updating = self._updating,
										key, data;
									// Copy dirty props to the original, applying setters if applicable
									for(key in dirtyObj){
										object[key] = dirtyObj[key];
									}
									if(colsWithSet){
										// Apply any set methods in column definitions.
										// Note that while in the most common cases column.set is intended
										// to return transformed data for the key in question, it is also
										// possible to directly modify the object to be saved.
										for(key in colsWithSet){
											data = colsWithSet[key].set(object);
											if(data !== undefined){ object[key] = data; }
										}
									}
									
									updating[id] = true;
									// Put it in the store, returning the result/promise
									return when(store.add(object), function (object) {
										// Clear the item now that it's been confirmed updated
										delete self.dirty[id];
										delete updating[id];
										delete _actions.add[id];
										var row = self.row(id);
										registry.findWidgets(row).forEach(function(w) { w.destroyRecursive(); });
										grid.removeRow(row);
									});
								};
							}

							// For every added item, grab the ID
							for(id in _actions.add) {
								// Add this item onto the promise chain
								promise = promise.then(getTemplate(id)).then(adder(id, _actions.add[id]));
							}

							// now delete rows

							function deleter (id) {
								var updating = self._updating;
								return function () {
									updating[id] = true;
									return when(store.remove(id), function (id) {
										delete updating[id];
										delete _actions["delete"][id];
									});
								};
							}

							// For every deleted item
							for(id in _actions["delete"]) {
								if (_actions["delete"][id]) {
									promise = promise.then(deleter(id));
								}
							}

							// now perform regular save as grid.dirty is cleaned up from new rows
							when(promise, function() { grid.save(); }).then(function (saved) {
								when(saved, function () {
									grid.revert();
									topic.publish("status/ok", "All changes saved");
								});
							});
							
							// Kick off and return the promise representing all applicable get/put ops.
							// If the success callback is fired, all operations succeeded; otherwise,
							// save will stop at the first error it encounters.
							d.resolve();
						}
					});
					self._buttons['save'].startup();
					self.buttons.addChild(self._buttons['save']);
					_state.watch(function(name, oldValue, newValue) {
						self._buttons['save'].set("disabled", !(this.get("valid") && this.get("modified")));
					});
				}
			}

			// summary:
			//		Place revert button in control area
			function _revertButton () {
				if (!self._buttons['revert']) {
					self._buttons['revert'] = new Btn({
						title: "Revert",
						disabled: true,
						'class': "controlButton",
						label: '<div class="sprite16 refreshSprite"></div>',
						onClick: function () {
							grid.revert();
						}
					}).placeAt(self.buttons);
					self.buttons.addChild(self._buttons["revert"]);
					self._buttons['revert'].startup();
					_state.watch(function(name, oldValue, newValue) {
						self._buttons['revert'].set("disabled", !this.get("modified"));
					});
				}
			}

			// set up validators for new row in temporary area
			function _addValidate(e) {
				var _renderCell = e.renderCell;
				e.renderCell = function (object, value, cell, options){
					var id = object[_idProperty];
					e.grid = grid;
					_renderCell.apply(this, arguments);
					if (cell.widget && cell.widget.validate) {
						var w = cell.widget;
						if (!_validators[id]) _validators[id] = [];
						_validators[id].push(lang.hitch(w, function () {
							var v = w.validate();
							if (!v) setTimeout(function () { w.focus(); }, 10);
							return v;
						}));
					}
					cell.widget._hasBeenBlurred = true;
				};
				return e;
			}

			// Special columns definition for new line
			if (this.access["post"]) {
				// declare grid with always on editors
				for (i=0; i<col.length; i++) {
					c = lang.mixin({id: _queryColumns[i].id}, col[i]);
					if (c.editor) {
						delete c.editOn;
						_newColumns.push(_addValidate(editor(c)));
					} else _newColumns.push(c);
				}
				_newColumns.push(button({
					grid: grid,
					label: '<div class="sprite16 deleteSprite"/>',
					title: 'delete',
					'class': 'controlButton',
					field: 'controlButton',
					sortable: false,
					onClick: function () {
						if (this.cell) {
							var row = grid.row(this.cell), id = row.id;
							delete grid.dirty[id];
							delete _actions.add[id];
							delete _validators[id];
							// here all widgets are always active so cleanup is easy
							registry.findWidgets(row).forEach(function(w) { w.destroyRecursive(); });
							grid.removeRow(row);
						}
					}
				}));
				// _newColumns = grid._configColumns("new-", _newColumns);

				_addButton();
				_saveButton();
				_revertButton();
			}

			if (this.access['put']) {
				_saveButton();
				_revertButton();
				on(grid, 'dgrid-datachange', function (evt) {
					put(evt.cell.row.element, ".dgrid-modified");
					_state.set("modified", true);
				});
			}
			this.inherited(arguments);
		},
		uninitialize: function () {
			this._grid.destroy();
			for (var b in this._buttons) {
				this._buttons[b].destroyRecursive();
			}
		}
	});
});
