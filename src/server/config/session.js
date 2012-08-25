// module:
//		server/config/session

define(["dojo/node!serializer"], function(serializer) {
	return {
		secret: serializer.randomString(256),
		ttl: 600000,
		reap: 6000
	};
});