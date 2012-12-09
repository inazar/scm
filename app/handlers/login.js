// module:
//		app/handlers/login

define([
	"app/ctrls/translate!login",
	"dojo/i18n!app/nls/login",
	"app/config",
	"dojo/_base/config",
	"dojo/cookie",
	"client/widgets/login",
	"dojox/validate/web",
	"dojox/encoding/digests/MD5",
	"dojo/on",
	"dojo/request",
	"dojo/window",
	"dojo/hash",
	"dojo/topic",
	"dojo/_base/lang",
	"app/ctrls/error"
], function (__, nls, config, dojoConfig, cookie, Login, validate, md5, on, request, win, hash, topic, lang, ErrorPane) {
	// summary:
	//		Manage login process

	return function(dialog) {
		var login = new Login({
			nls: nls,
			action: config.urls.login,
			dialog: dialog
		});

		if (login.email) {
			login.email.validator = validate.isEmailAddress;
			lang.mixin(login.email, nls.hint.email);
		}
		function _format(val) { return this.get("displayedValue"); }
		function _parse(val) { return val ? md5(val) : ''; }
		if (login.password) {
			login.password.format = _format;
			login.password.parse = _parse;
			if (login.confirm) login.password.validator = function (value) {
				return this.get('displayedValue').length >= 5;
			};
			lang.mixin(login.password, nls.hint.password);
		}
		if (login.confirm) {
			login.confirm.format = _format;
			login.confirm.parse = _parse;
			lang.mixin(login.confirm, nls.hint.confirm);
			login.confirm.validator = function (value) {
				return value === login.password.get('displayedValue');
			};
		}

		if (login.reset) {
			on(login.reset, 'click', function () {
				var email = login.email;
				if (email.validate(email.focused)) {
					request.post(config.urls.reset, {
						data: {email: email.get('value')},
						headers: { "X-CSRF-Token": cookie(config.csrf) }
					}).then(function(result) {
						topic.publish("status/ok", __(result));
					});
				} else email.focus();
			});
		}

		on(login.form.domNode, 'submit', function(e) {
			e.preventDefault();
			if (login.form.validate()) {
				request.post(login.action, {
					data: login.form.get('value'),
					headers: { "X-CSRF-Token": cookie(config.csrf) }
				}).then(function(url) {
					var l = win.get(login.ownerDocument).location;
					if (dialog) l.reload(true);
					else l.assign(url);
				});
			}
		});
		if (dialog) return login;

		if (login.errorPane) {
			var errorHandler = new ErrorPane({
				internal: true,
				filter: function (obj) {
					var newObj = {};
					['name', 'message'].forEach(function (prop) { newObj[prop] = obj[prop]; });
					return newObj;
				}
			}, login.errorPane);
		}
		login.placeAt("appLayout");
		login.startup();
		if (login.place) {
			on(window, "resize", lang.hitch(login, login.place));
			login.place();
		}
		if (dojoConfig.flash) {
			var flash = dojoConfig.flash;
			topic.publish("status/"+flash.status, __(flash.message));
		}
	};
});
