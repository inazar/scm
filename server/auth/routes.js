define([
	"dojo/node!connect-ensure-login",
	"dojo/Deferred",
	"dojo/when",
	"server/auth/oauth2",
	"server/config/env",
	"server/node/error",
	"server/node/utils",
	"server/node/mail",
	"server/classes/User"
], function (login, Deferred, when, oauth2, env, error, utils, mail, User) {

	// summary:
	//		GET /login:
	//			- if no root in the system show only request for email
	//			- render standard login page
	//		POST /login:
	//			- if root is not defined accept only email and send confirmation mail to user
	//			- if 'confirm' field is set accept password reset for user with given email and code, remove code
	//			- expect login/password and perform normal authentication
	//		POST /login/reset:
	//			- set up reset code and send mail to user
	//		GET /confirm:
	//			- expect encoded email and code as 'hash' query param. Set confirmed and render password request
	//				with email and code fields set
	//		GET /logout:
	//			- log current user out

	return function (app, passport) {
		var secure = env.dotcloud ? "https://" : "http://"
		function ensureSecure (req, res, next) {
			if (env.dotcloud && req.headers["x-forwarded-port"] != 443) {
				res.redirect("https://" + env.host + req.url);
			} else next();
		}
		function requestConfirmation (email, subj, code) {
			mail(email, subj, "http://"+env.host+env.confirm+'?hash='+utils.encode({email: email, code: code}));
		}

		function toLogin(type, res, post) {
			var flash = null, status = "error";
			switch (type) {
				case "bad":
					flash = "Bad request";
					break;
				case "db":
					flash = "Database error";
					break;
				case "notfound":
					flash = "Not found";
					break;
				case "success":
					flash = "Registration succeeded";
					status = "ok";
					break;
				case "reset":
					flash = "Password reset";
					status = "ok";
					break;
				case "email":
					flash = "Check your email";
					status = "ok";
					break;
				default:
					break;
			}
			if (flash) res.flash(status, flash);
			if (post) res.send(secure + env.host + env.login);
			else res.redirect(secure + env.host + env.login);
		}

		// register confirm
		app.get(env.confirm, [ ensureSecure, function (req, res, next) {
			var data = utils.decode(req.query.hash);
			if (!data) return toLogin("bad", res);
			User.findOne({
				email: data.email,
				code: data.code
			}, "+secret", function(err, user) {
				if (err) return toLogin("db", res);
				if (!user) return toLogin("notfound", res);
				user.confirmed = true;
				user.save(function (err) {
					if (err) toLogin("db", res);
					else res.render('layout', { layout: false, csrf: req.session._csrf, email: user.email, code: user.code });
				});
			});
		} ]);
		// login reset
		app.post(env.reset, [ ensureSecure, function (req, res, next) {
			var parsed = req.body;
			User.findOne({email: parsed.email}, function (err, user) {
				if (err) return next(err);
				if (!user) return res.NotFound();
				user.code = utils.uid(5);
				user.save(function (err) {
					if (err) return next(err);
					requestConfirmation(user.email, 'Reset password', user.code);
					res.send("Email sent");
				});
			});
		} ]);
		// login page
		app.get(env.login, [ ensureSecure, function (req, res, next) {
			if (req.user) res.redirect("http://" + env.host + env.rootUrl);
			else res.render('layout', {layout: false, csrf: req.session._csrf, root: app.root});
		} ]);
		// login post
		app.post(env.login, [ ensureSecure, function(req, res, next) {
			var parsed = req.body;
			if (app.root) {
				// root is already defined
				if (parsed && parsed.confirm) {
					// user tries to set password
					User.findOne({email: parsed.email, code: parsed.code}, "+secret", function (err, user) {
						if (err) return next(err);
						if (!user) return res.NotFound();
						if (!parsed.password || parsed.password !== parsed.confirm) return res.BadRequest();
						var success = user.secret ? "reset" : "success";
						user.secret = parsed.password;
						User.collection.update({_id: user.get('_id')}, { $unset: {code: true} }, function(err) {
							if (err) return next(err);
							user.save(function(err) { toLogin(err ? "db" : success, res, true); });
						});
					});
				} else {
					// normal login
					passport.authenticate('local', function(err, user, info) {
						if (err) return next(err);
						if (!user) return res.Unauthorized(info);
						else {
							req.logIn(user, function (err) {
								if (err) return next(err);
								if (req.session && req.session.returnTo && req.session.returnTo !== env.login) {
									url = "http://" + env.host + req.session.returnTo;
									delete req.session.returnTo;
								} else url = "http://" + env.host + env.rootUrl;
								return res.send(url);
							});
						}
					})(req, res, next);
				}
			} else {
				// root does not exist - only email expected
				if (!parsed || !parsed.email) return next(error.BadRequest());
				User.findOne({email: parsed.email}, function (err, user) {
					if (err) return next(err);
					var d = new Deferred();
					if (user) {
						user.root = true;
						user.save(function(err) {
							if (err) d.reject(err);
							else d.resolve(user);
						});
					} else {
						User.create({
							email: parsed.email,
							confirmed: false,
							root: true,
							code: utils.uid(5)
						}, function(err, user) {
							if (err) d.reject(err);
							else d.resolve(user);
						});
					}
					when(d, function(user) {
						app.root = true;
						requestConfirmation(user.email, 'Confirm registration', user.code);
						toLogin("email", res, true);
					}, next);

				});
			}
		} ]);
		// logout
		app.get(env.logout, function(req, res, next) {
			req.logout();
			res.redirect("http://" + env.host + env.rootUrl);
		});

		app.get(env.authorize, oauth2.authorization);
		app.post(env.decision, oauth2.decision);
		app.post(env.token, oauth2.token);

		var d = new Deferred();
		User.findOne({root: true}, function (err, user) {
			if (err) d.reject(err);
			else d.resolve(!!user);
		});
		return d.promise;
	};
});