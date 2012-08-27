define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/node!util",
	"dojo/node!path",
	"dojo/node!express",
	"dojo/node!ejs",
	"dojo/node!express/lib/response",
	"./node/session",
	"dojo/node!passport",
	"./auth/strategies",
	"./auth/routes",
	"dojo/node!connect-ensure-login",
	"./config/session",
	"./config/env"
], function(declare, lang, util, path, express, ejs, Response, SessionStore, passport, strategies, authRoutes, login, sessionConfig, env) {
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
	//		9) Initialize locals for template engine
	//		10) Initialize passport
	//		11) Set up router for server applications
	//		12) Set up authentication strategies
	//		11) Set up routes for unathorized access
	//		13) Set up access verification
	//		14) Set up secure routes
	//		15) Set up error handling for xhr requests
	//		16) Set up error handling for page request
	//		17) Start server

	// 1) Add convenience methods to Response object
	var errors = {
		BadRequest: 400,
		Unauthorized: 401,
		PaymentRequired: 402,
		Forbidden: 403,
		NotFound: 404,
		MethodNotAllowed: 405,
		NotAcceptable: 406,
		InternalError: 500,
		NotImplemented: 501,
		BadGateway: 502,
		ServiceUnavailable: 503
	};

	for (var k in errors) {
		(function (type) {
			Response[type] = function (msg) {
				if (msg) this.send(errors[type], {name: "Error", message: msg});
				else this.send(errors[type], {name: "Error", message: type});
			}
		})(k);
	}

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
		['app', 'client', 'lib'].forEach(function(p) {
			app.use('/' + p, express.static(path.join(env.root, p)));
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
		// 9) Initialize locals for template engine
		app.use(function(req, res, next) {
			res.locals({});
			next();
		});
		// 10) Initialize passport
		app.use(passport.initialize());
		app.use(passport.session());
		// 11) Set up router for server applications
		app.use(app.router);
		// 12) Set up authentication strategies
		strategies(passport);
		// 11) Set up routes for unathorized access
		authRoutes(app, passport);
		// 13) Set up access verification
		app.use(login.ensureLoggedIn({ redirectTo: env.login }));
		// 14) Set up secure routes
		// 15) Set up error handling for xhr requests
		app.use(function(err, req, res, next) {
			if (req.xhr) res.send(err.status ? err.status : 500, { name: err.name, message: err.message });
			else next(err);
		});
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
	});
	// 17) Start server
	app.listen(env.port, function() {
		util.log("Express server listening on port "+env.port+" in "+app.settings.env+" mode");
	});
});
