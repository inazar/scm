// module:
//		server/config/session

define(["../node/utils"], function(util) {
	return {
		secret: util.uid(32),
		ttl: 600000,
		reap: 60000
	};
});