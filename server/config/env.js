// module:
//		server/config/env

define(["dojo/node!path", "app/config"], function(path, config) {
	var urls = config.urls, env = process.env;
	return {
		// summary:
		//		This is the server environment configuration object.

		// dotcloud: Boolean
		//		Weather server is run on dotcloud service
		dotcloud: !!env['DOTCLOUD_PROJECT'],

		// root: String
		//		Root path
		root: path.join(dojo.baseUrl, '..', '..'),

		// host: String
		//		Host listened by application
		host: env['DOTCLOUD_NODEJS_HTTP_HOST'] || 'localhost:3050',

		// port: Number
		//		Port listened by application
		port: env['PORT_WWW'] || 3050,

		// rootUrl: String
		//		Root URL
		rootUrl: urls.base,

		// register: String
		//		Register URL
		register: urls.register,

		// login: String
		//		Login URL
		login: urls.login,

		// confirm: String
		//		Confirm URL
		confirm: urls.confirm,

		// reset: String
		//		Reset URL
		reset: urls.reset,

		// logout: String
		//		Logout URL
		logout: urls.logout,

		// authorize: String
		//		Authorize URL
		authorize: urls.authorize,

		// decision: String
		//		Decision URL
		decision: urls.decision,

		// token: String
		//		Token URL
		token: urls.token,

		// loginFailures: Number
		//		Maximum number of failures before user is blocked
		loginFailures: 3

	};
});
