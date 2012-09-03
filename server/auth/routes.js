define([
	"dojo/node!connect-ensure-login",
	"./oauth2",
	"../config/env",
	"../node/error",
	"../node/utils",
	"../node/mail",
	"../classes/User"
], function (login, oauth2, env, error, utils, mail, User) {

	return function(app, passport) {
		var ensureSecure = function (req, res, next) {
			if (env.dotcloud && req.header["X-Forwarded-Port"] !== 443) {
				res.redirect("https://" + env.host + req.url);
			} else next();
		};
		// login page
		app.get(env.login, [ ensureSecure, function (req, res, next) {
			res.render('layout', {layout: false, action: env.login, body: ''});
		} ]);
		// login post
		app.post(env.login, [ ensureSecure, function(req, res, next) {
			passport.authenticate('local', function(err, user, info) {
				if (err) return next(err);
				if (!user) {
					next(error.Unauthorized(info));
				} else {
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
		} ]);
		// register confirm
		app.get(env.register+'/:email/:hash', function (req, res, next) {
			User.findOne({admin: true, confirmed: true}, function (err, user) {
				if (err || user) return res.send(404);
				User.findOne({
					email: req.params.email,
					code: req.params.hash
				}, function(err, user) {
					if (!err && user) {
						User.collection.update({_id: user.get('_id')}, {$unset: {code: true}});
						user.confirmed = true;
						user.save();
					}
					res.redirect("http://" + env.host + env.login);
				});
			});
		});
		// register page
		app.get(env.register, function (req, res, next) {
			User.findOne({admin: true}, function (err, user) {
				if (err || user) return res.send(404);
				if (env.dotcloud && req.header["X-Forwarded-Port"] !== 443) res.redirect("https://" + env.host + req.url);
				else res.render('layout', {layout: false, action: env.login, body: ''});
			});
		});
		// register post
		app.post(env.register, function (req, res, next) {
			User.findOne({admin: true}, function (err, user) {
				if (err || user) return res.send(404);
				var parsed = req.body;
				if (!parsed || !parsed.email) return next(error.BadRequest("email is not set"));
				if (!parsed.password) return next(error.BadRequest("password is not set"));
				if (parsed.password !== parsed.confirm) return next(error.BadRequest("passwords do not match"));
				var strict = User.schema.set('strict');
				User.schema.set('strict', false);
				User.findOneAndUpdate({
					email: parsed.email
				}, {
					confirmed: false,
					secret: parsed.password,
					admin: true,
					code: utils.uid(5)					
				}, { upsert: true }, function(err, user) {
					if (err) return next(err);
					mail(user.email, 'Confirm registration', "http://"+env.host+env.register+'/'+user.email+'/'+user.get('code'));
					res.send("http://" + env.host + env.rootUrl);
				});
				User.schema.set('strict', strict);
			});
		});
		// logout
		app.get(env.logout, function(req, res, next) {
			req.logout();
			res.redirect("http://" + env.host + env.rootUrl);
		});

		app.get(env.authorize, oauth2.authorization);
		app.post(env.decision, oauth2.decision);
		app.post(env.token, oauth2.token);

	};
});