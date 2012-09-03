// module:
//		app/handlers/login

define([
	"app/nls/translate!login",
	"app/config",
	"client/widgets/login",
	"dojox/validate/web",
	"dojox/encoding/digests/MD5",
	"dojo/on",
	"dojo/request",
	"dojo/window",
	"dojo/_base/lang",
	"app/handlers/error"
], function (__, config, Login, validate, md5, on, request, win, lang, ErrorPane) {
	// summary:
	//		Manage login process

	var login = new Login({
		nls: __.nls,
		action: config.urls.login
	});
	if (login.errorPane) {
		var errorHandler = new ErrorPane({
			filter: function (obj) {
				var newObj = {};
				['name', 'message'].forEach(function (prop) { newObj[prop] = obj[prop]; });
				return newObj;
			}
		}, login.errorPane);
	}

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
				win.get(login.ownerDocument).location.href = url;
			});
		}
	});
	login.placeAt("appLayout");
	if (login.place) {
		on(window, "resize", lang.hitch(login, login.place));
		login.place();
	}
});
