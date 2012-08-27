// module:
//		server/config/env

define(["dojo/node!path"], function(path) {
	return {
		// summary:
		//		This is the server environment configuration object.

		// dotcloud: Boolean
		//		Weather server is run on dotcloud service
		dotcloud: !!process.env['DOTCLOUD_PROJECT'],

		// root: String
		//		Root path
		root: path.join(dojo.baseUrl, '..', '..'),

		// host: String
		//		Host listened by application
		host: process.env['DOTCLOUD_NODEJS_HTTP_HOST'] || 'localhost:3050',

		// port: Number
		//		Port listened by application
		port: process.env['PORT_WWW'] || 3050,

		// rootUrl: String
		//		Root URL
		rootUrl: '/',

		// login: String
		//		Login URL
		login: '/login',

		// logout: String
		//		Logout URL
		logout: '/logout',

		// authorize: String
		//		Authorize URL
		authorize: '/authorize',

		// decision: String
		//		Decision URL
		decision: '/authorize/grant',

		// token: String
		//		Token URL
		token: '/oauth/token'

	};
});
