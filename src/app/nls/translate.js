// module:
//	app/nls/translate
define([], function () {
	return {
		load: function (/*string*/ id, /*Function*/ require, /*Function*/ load) {
			require(["dojo/i18n!/app/nls/"+(id || 'index')+".js"], function (nls) {
				function __(str) {
					if (!str) return str;
					if (nls[str]) return nls[str];
					console.warn("Cannot translate '%s' from file '%s'", str, id);
					return str;
				}
				__.nls = nls;
				load(__);
			});
		}
	};
});