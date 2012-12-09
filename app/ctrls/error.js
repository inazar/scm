// module:
//		app/ctrls/error

define([
	"app/ctrls/translate!error",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/on",
	"dojo/topic",
	"dojo/request/notify",
	"dojo/window",
	"client/widgets/error",
	"client/widgets/Dialog",
	"app/handlers/login",
	"app/config"
], function (__, declare, lang, on, topic, notify, win, ErrorWidget, Dialog, login, config) {

	var errors = {};
	for (var k in config.errors) errors[config.errors[k]] = k;

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
		_timeout: null,
		_message: null,
		_warning: null,
		constructor: function (/*Object*/ kwArgs){
			lang.mixin(this, kwArgs);
			var self = this;
			// summary:
			//		subscribe to error messages
			this.inherited(arguments);
			// monitor io start to show loaging animation or message
			notify("start", function(res) {
				self.loader(true);
				if (self._timeout) {
					clearTimeout(self._timeout);
					self._timeout = null;
				}
			});
			// monitor io stop to stop loading and show status - error or Ok
			notify("stop", function(res) {
				self.loader(false);
				self._timeout = setTimeout(function() {
					self._timeout = null;
					if (!self._errors.length) self.ok();
					else self.error(self._errors[0]);
					self._message = null;
					self._warning = null;
					self._errors = [];
				}, 750);
			});
			// monitor io errors
			notify("error", function(err) {
				
				var status = err.response.status;

				function _displayError() {
					var json, k;
					try {
						json = JSON.parse(err.response.data);
						for (k in json) json[k] = __(json[k]);
					} catch (e) {
						json = status ? { name: __(errors[status]) || status } : { name: __("Cannot connect to server") };
						json.message = '';
					}
					json.info = __(json.info) || err.response.options.method+' '+err.response.url;
					self._errors.push(json);
					return json;
				}

				if (status === 401 && !self.internal) { // Unathorized
					var dialog = new Dialog({
						title: __("login"),
						content: login(true),
						onCancel: function () {
							dialog.destroyRecursive();
							self.error(_displayError());
						}
					});
					dialog.show();
				} else _displayError();
			});

			topic.subscribe("status/ok", function(msg){ self._message = msg; });
			topic.subscribe("status/error", function(msg){ self._errors.push({name: msg, message: ''}); });
		}
	});
});
