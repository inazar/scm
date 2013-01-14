// module:
//		app/models/extend
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/aspect"
], function (declare, lang, aspect) {
	// summary:
	//		extend JsonStore based on base store store with additional target parameter

	return function (o, store) {
		return new declare(function() {
			this.target = (o.pre || '') + (o.target ? o.target : store.target) + (o.post || '');
			if (o.columns) this.columns = o.columns;
			if (o.pages) this.pages = o.pages;
		}, store)();
	};
});
