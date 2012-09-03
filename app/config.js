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
		'ua': 'ua-uk'
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
	}

});
