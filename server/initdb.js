var mongodb = require('mongoose/node_modules/mongodb'),
	util = require('util');
var scmdb = process.env["SCM_DB"],
	scmuser = process.env['SCM_DB_LOGIN'],
	scmpass = process.env['SCM_DB_PASSWORD'],
	user = process.env["DOTCLOUD_DB_MONGODB_LOGIN"],
	secret = process.env["DOTCLOUD_DB_MONGODB_PASSWORD"],
	host = process.env["DOTCLOUD_DB_MONGODB_HOST"],
	port = Number(process.env["DOTCLOUD_DB_MONGODB_PORT"]);

if (!scmdb || !scmuser || !scmpass || !user || !secret || !host || !port) {
	util.error("initdb: missing arguments");
	util.error(util.inspect({
		scmdb: scmdb,
		scmuser: scmuser,
		scmpass: scmpass,
		user: user,
		secret: secret,
		host: host,
		port: port
	}));
	process.exit(1);
}
var db = new mongodb.Db(scmdb, new mongodb.Server(host, port), {w: 1, safe: false});

db.open(function(err, db) {
	if (err) {
		util.error("initdb: Failed to open database: "+err.message);
		process.exit(1);
	}
	db.admin().authenticate(user, secret, function(err, result) {
		if (err) {
			util.error("initdb: Failed to authenticate: "+err.message);
			process.exit(1);
		}
		db.addUser(scmuser, scmpass, function(err, result) {
			if (err) {
				util.error("initdb: Failed to add user: "+err.message);
				process.exit(1);
			}
			util.print("SCM user '"+scmuser+"' added to database '"+scmdb+"'\n");
			process.exit(0);
		});
	});
});
