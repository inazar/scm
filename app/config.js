// module:
//		app/config/app

define({
	// summary:
	//		This is the application configuration object.

	// name: String
	//		Application name
	name: 'Application',

	// locales: Object
	//		Locales supported by application
	locales: {
		'en': 'en-us',
		'ru': 'ru-ru',
		'uk': 'uk-ua'
	},
	// defaultLocale: String
	//		The locale to use as default
	defaultLocale: 'ru-ru',

	// urls: Object
	//		application urls
	urls: {
		// baseUrl: String
		//		Root URL
		base: '/',

		// login: String
		//		Login URL
		login: '/login',

		// logout: String
		//		Logout URL
		logout: '/logout',

		// register: String
		//		Register URL
		register: '/register',

		// authorize: String
		//		Authorize URL
		authorize: '/authorize',

		// decision: String
		//		Decision URL
		decision: '/authorize/grant',

		// token: String
		//		Token URL
		token: '/oauth/token'
	},
	errors: {
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
	},
	routes: {
		'/profile': 'profile',
		'/admin/:cid/user': 'admin/user',
		'/admin/:cid': 'admin/client',
		'/admin': "admin"
	}
});
