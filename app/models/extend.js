// module:
//		app/models/extend
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/aspect"
], function (declare, lang, aspect) {
	// summary:
	//		extend JsonStore based on base store store with additional target parameter

	return declare(null, {
		constructor: function (original, target) {
			var self = this;
			this.original = original;
			lang.mixin(this, original, {
				get: lang.hitch(original, "get"),
				getIdentity: lang.hitch(original, "getIdentity"),
				put: lang.hitch(original, "put"),
				add: lang.hitch(original, "add"),
				remove: lang.hitch(original, "remove"),
				query: lang.hitch(original, "query")
			});
			function _targetAdvise(originalMethod) {
				return function () {
					var s = original.target;
					original.target = original.target + target + '/';
					var result = originalMethod.apply(original, arguments);
					original.target = s;
					return result;
				};
			}
			aspect.around(original, "get", _targetAdvise);
			aspect.around(original, "put", _targetAdvise);
			aspect.around(original, "add", _targetAdvise);
			aspect.around(original, "remove", _targetAdvise);
			aspect.around(original, "query", _targetAdvise);
		}
	});
});
