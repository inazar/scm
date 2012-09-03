// module:
//		app/handlers/register

define([
	"app/nls/translate!login",
	"dojo/i18n!app/nls/login",
	"app/config",
	"client/widgets/register",
	"dojox/validate/web",
	"dojox/encoding/digests/MD5",
	"dojo/on",
	"dojo/request",
	"dojo/window",
	"dojo/_base/lang",
	"app/handlers/error"
], function (__, nls, config, Register, validate, md5, on, request, win, lang, ErrorPane) {
	// summary:
	//		Manage login process

	var register = new Register({
		nls: nls,
		action: config.urls.register
	});
	if (register.errorPane) {
		var errorHandler = new ErrorPane({
			filter: function (obj) {
				var newObj = {};
				['name', 'message'].forEach(function (prop) { newObj[prop] = obj[prop]; });
				return newObj;
			}
		}, register.errorPane);
	}

	register.email.validator = validate.isEmailAddress;
	register.email.invalidMessage = __("Invalid email");
	register.password.format = register.confirm.format = function(val) { return this.get("displayedValue"); };
	register.password.parse = register.confirm.parse = function(val) { return val ? md5(val) : ''; };

	on(register.form.domNode, 'submit', function(e) {
		e.preventDefault();
		if (register.form.validate()) {
			request.post(config.urls.register, {
				data: register.form.get('value')
			}).then(function(url) {
				win.get(register.ownerDocument).location.href = url;
			}, function() {
				console.log("Failure", arguments);
			});
		}
	});
	register.placeAt("appLayout");
	if (register.place) {
		on(window, "resize", lang.hitch(register, register.place));
		register.place();
	}
});
