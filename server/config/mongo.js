// module:
//		server/config/mongo

define({
	// summary:
	//		This is the database configuration object.
	//		Database will be connected with string
	//			{engine}://{login}:{password}@{host}:{port}

	// engine: String
	//		Database engine
	engine: 'mongodb',

	// db: String
	//		The name of application database
	db: process.env['SCM_DB'] || 'scmdb',

	// port: Number
	//		The port listened by database engine
	port: process.env['DOTCLOUD_DB_MONGODB_PORT'] || 27017,

	// host: String
	//		host where database is listening
	host: process.env['DOTCLOUD_DB_MONGODB_HOST'] || 'localhost',

	// login: String
	//		database login
	login: process.env['SCM_DB_LOGIN'] || 'scm',

	// password: String
	//		database password
	password: process.env['SCM_DB_PASSWORD'] || 'Pa$$W0Rd'
});
