// module:
//		app/handlers/error

define([
	"app/nls/translate!error",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/on",
	"dojo/request/notify",
	"client/widgets/error"
], function (__, declare, lang, on, notify, ErrorWidget) {
	// summary:
	//		declare error pane which establish error monitoring.
	//		Error pane object API:
	//			ok: Function
	//			error: Function
	//			warning: Function
	//			loader: Function, boolean param shows if loader starts or stops

	return declare([ErrorWidget], {
		// _errors: Array
		//		Keep track of errors during io, clear on next io
		//	|	{
		//	|		name: Error name, default "Error"
		//	|		message: error messag, may be empty
		//	|		info: url which raised the error
		//	|	}
		_errors: [],
		constructor: function (/*Object*/ kwArgs){
			lang.mixin(this, kwArgs);
			var self = this;
			// summary:
			//		subscribe to error messages
			this.inherited(arguments);
			// monitor io start to show loaging animation or message
			notify("start", function(res) {
				self.loader(true);
				self._errors = [];
			});
			// monitor io stop to stop loading and show status - error or Ok
			notify("stop", function(res) {
				self.loader(false);
				if (!self._errors.length) self.ok();
				else self.error(self._errors[0]);
			});
			// monitor io errors
			notify("error", function(err) {
				var json, k;
				try {
					json = JSON.parse(err.response.data);
					for (k in json) json[k] = __(json[k]);
				} catch (e) {
					json = {
						name: __("JSON error"),
						message: __(e.message)
					};
				}
				json.info = __(json.info) || err.response.options.method+' '+err.response.url
				self._errors.push(json);
			});
		}
	});
});
