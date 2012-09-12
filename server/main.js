define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/node!util",
	"dojo/node!path",
	"dojo/node!express",
	"dojo/node!ejs",
	"./node/error",
	"./node/session",
	"dojo/node!passport",
	"./auth/strategies",
	"./auth/routes",
	"dojo/node!connect-ensure-login",
	"./config/session",
	"./node/restify",
	"./auth/access",
	"./config/env",
	"app/config"
], function(declare, lang, util, path, express, ejs, registerErrorHandlers, SessionStore, passport, strategies, authRoutes, login, sessionConfig, restify, access, env, config) {
	// module:
	//		server/node/app

	// summary:
	//		Perform all activities, necessary to configure and start up application server
	//		1) Add convenience methods to Response object
	//		2) Collect routes from "app/routes" and create routes and access objects
	//		3) Create Express server
	//		4) Set up template engine
	//		5) Parse request body
	//		6) Set up static routes and favicon
	//		7) Set up request logging (skip statics ???)
	//		8) Set up sessions
	//		10) Initialize passport
	//		9) Initialize locals for template engine
	//		11) Set up router for server applications
	//		12) Set up authentication strategies
	//		11) Set up routes for unathorized access
	//		13) Set up access verification
	//		14) Set up secure routes
	//		15) initialize user access handling
	//		15) Set up error handling for xhr requests
	//		16) Set up error handling for page request
	//		17) Start server

	// 1) Add convenience methods to Response object
	registerErrorHandlers();
	// 2) Collect routes from "app/routes" and create routes and access objects
	// 3) Create Express server
	var app = express();

	// start server configuration
	app.configure('production', function(){
		app.use(express.staticCache());	 // memory cache layer for the static() middleware
	});

	app.configure(function() {
		// 4) Set up template engine
		app.set('views', path.join(env.root, 'server', 'views'));
		app.set('view engine', 'ejs');
		// support ejs with layout
		app.engine('ejs', function(view, options, callback) {
			// apply the layout if there is one
			if (options.layout !== false) {
				ejs.renderFile(view, options, function(err, str) {
					ejs.renderFile(path.join(app.get('views'), typeof options.layout === "string" ? options.layout : 'layout.ejs'), lang.mixin({body: str}, options), callback);
				});
			} else ejs.renderFile.apply(ejs, arguments);
		});

		// 5) Parse request body
		app.use(express.bodyParser());

		// 6) Set up static routes and favicon
		app.use(express.favicon('path'));   // TODO: create favicon
		// expose only few folders
		var staticBase = app.get('env') === 'production' ? path.join(env.root, 'production') : env.root;
		['app', 'client', 'lib'].forEach(function(p) {
			app.use('/' + p, express['static'](path.join(staticBase, p))); // jslint consider this .static as error
		});

		// 7) Set up request logging (skip statics ???)
		app.use(express.logger(app.settings.env === 'development' ? 'dev' : null));

		// 8) Set up sessions
		app.use(express.cookieParser(sessionConfig.secret));	// parse cookies
		app.use(express.session({
			store: new SessionStore({
				ttl: sessionConfig.ttl,
				reap: sessionConfig.reap
			})
		}));
		// 10) Initialize passport
		app.use(passport.initialize());
		app.use(passport.session());
		// 5) determine user locale
		app.use(function (req, res, next) {
			var requested = req.headers["accept-language"] || '';
			var _ref = requested.match(/[a-z]+/gi);
			req.locale = (_ref[0] in config.locales) ? _ref[0] : config.defaultLocale;
			next();
		});
		// 9) Initialize locals for template engine
		app.use(function(req, res, next) {
			res.locals({
				locale: req.user && req.user.locale ? req.user.locale : req.locale ? req.locale.toLowerCase() : config.defaultLocale,
				user: req.user ? req.user.get('_id') : null,
				client: req.user && req.user.customer ? req.user.customer.get('_id') : null
			});
			next();
		});
		// 11) Set up router for server applications
		app.use(app.router);
		// 12) Set up authentication strategies
		strategies(passport);
		// 11) Set up routes for unathorized access
		authRoutes(app, passport);
		// 13) Set up access verification
		["get", "put", "post", "delete"].forEach(function(m) {
			app[m](config.urls.base+'*', function(req, res, next) {
				if ((!req.isAuthenticated || !req.isAuthenticated())) {
					if (req.xhr) res.Unauthorized();
					else res.redirect(env.login);
				} else next();
			});
		});
		// 14) Set up secure routes
		restify(app, path.join(env.root, 'server', 'rest')).then(
			function (accessTemplate) {
				// 15) initialize user access handling
				access.template = accessTemplate;
				// 15) set up main page handler for client
				app.get(config.urls.base, function (req, res, next) {
					res.render('layout', {layout: false, body: ''});
				});
				// 15) Set up error handling for xhr requests
				app.use(function(err, req, res, next) {
					if (req.xhr) res.send(err.status ? err.status : 500, { name: err.name, message: err.message });
					else next(err);
				});
				// 16) Set up error handling for page request
				app.configure('development', function() {
					app.use(express.errorHandler({
						dumpExceptions: true,
						showStack: true
					}));
				});
				app.configure('production', function() {
					app.use(express.errorHandler());
					app.set('json spaces', 0);
				});
				// 17) Start server
				app.listen(env.port, function() {
					util.log("Express server listening on port "+env.port+" in "+app.get('env')+" mode");
				});
			}, function (err) { util.error("Error loading routes: "+err.message); }
		);
	});
});
