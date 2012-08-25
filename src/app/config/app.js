// module:
//		app/config/app

define({
	// summary:
	//		This is the application configuration object.

	// baseUrl: String
	//		The application base url
	baseUrl: 'http://localhost:3050',

	// name: String
	//		Application name
	name: 'Application',

	// host: String
	//		Host listened by application
	host: '',

	// port: Number
	//		Port listened by application
	port: process.env['PORT_WWW'] || 3050,

	// locales: Object
	//		Locales supported by application
	locales: {
		'en': 'en-us',
		'ru': 'ru-ru',
		'ua': 'ua-uk',
		'default': 'ru-ru'
	}
});
