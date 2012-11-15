// module:
//		app/handlers/login

define([
	"app/ctrls/translate!login",
	"dojo/i18n!app/nls/login",
	"app/config",
	"client/widgets/login",
	"dojox/validate/web",
	"dojox/encoding/digests/MD5",
	"dojo/on",
	"dojo/request",
	"dojo/window",
	"dojo/_base/lang",
	"app/ctrls/error"
], function (__, nls, config, Login, validate, md5, on, request, win, lang, ErrorPane) {
	// summary:
	//		Manage login process

	return function(dialog) {
		var login = new Login({
			nls: nls,
			action: config.urls.login
		});

		login.email.validator = validate.isEmailAddress;
		login.email.invalidMessage = __("Invalid email");
		login.password.format = function(val) { return this.get("displayedValue"); };
		login.password.parse = function(val) { return val ? md5(val) : ''; };

		on(login.form.domNode, 'submit', function(e) {
			e.preventDefault();
			if (login.form.validate()) {
				request.post(config.urls.login, {
					data: login.form.get('value')
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
		if (login.place) {
			on(window, "resize", lang.hitch(login, login.place));
			login.place();
		}
	};
});
