define(["dojo/node!util", "dojo/node!mongoose", "../config/mongo"], function(util, mongoose, config){
// module:
//		server/node/mongo

	// summary:
	//		Create database connection and monitor if connections works out
	var url = config.engine + '://' + config.login + ':' + config.password + '@' + config.host + ':' + config.port,
		storage = mongoose.connect(url + '/' + config.db);

	function connect(err) {
		if (err) {
			util.error("Failed to connect to database");
			process.exit(100);
		} else util.log("Connected to database '"+config.host+":"+config.port+"/"+config.db+"'");
	}
	mongoose.connection.once('error', connect);
	mongoose.connection.once('open', function () {
		mongoose.connection.removeListener('error', connect);
		connect();
	});

	return storage;
});