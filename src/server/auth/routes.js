define(["dojo/node!connect-ensure-login", "./oauth2", "../config/env"], function (login, oauth2, env) {

	return function(app, passport) {
		var ensureSecure = app.ensureSecure = function (req, res, next) {
			if (env.dotcloud && req.header["X-Forwarded-Port"] !== 443) {
				res.redirect("https://" + env.host + req.url);
			} else next();
		};

		app.get(env.login, [ ensureSecure, function (req, res, next) {
			res.render('login', {layout: false, action: env.login});
		} ]);

		app.post(env.login, [ ensureSecure, passport.authenticate('local', {
			successReturnToOrRedirect: "http://" + env.host + env.rootUrl,
			failureRedirect: env.login 
		}) ]);

		app.get(env.logout, function(req, res, next) {
			req.logout();
			res.redirect("http://" + env.host + env.rootUrl);
		});

		app.get(env.authorize, oauth2.authorization);
		app.post(env.decision, oauth2.decision);
		app.post(env.token, oauth2.token);

	};
});