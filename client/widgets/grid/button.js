define([
	"dojo/_base/declare",
	"dojo/aspect",
	"dojo/_base/lang",
	"dijit/form/Button"
], function(declare, aspect, lang, Button){

	var grid, listeners = [];

	// add advice for cleaning up widgets in this column

	return function (column) {
		var o = lang.mixin({}, column);
		return declare.safeMixin(column, {
			destroy: function(){
				listeners.forEach(function(l){ l.remove(); });
				if (column.button) column.button.destroyRecursive();
			},
			renderCell: function(object, value, cell, options, header){
				if (!o.hidden) {
					var btn = column.button = new Button(o);
					btn.objectId = object[this.grid.store.idProperty];
					btn.cell = cell;
					btn.startup();
					return btn.domNode;
				} else return "";
			},
			renderHeaderCell: function(th){
				//th.appendChild(document.createTextNode("header"));
			}
		});
	};
});