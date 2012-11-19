// module:
//		server/routes/notFound
define([
	"dojo/Deferred",
	"../node/error"
], function (Deferred, error) {
	return {
		children: function (user, params) {
			// summary:
			//		simply report error
			var d = new Deferred();
			d.reject(error.BadRequest("route not found!"));
			return d.promise;
		}
	};
});