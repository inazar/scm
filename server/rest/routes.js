define([
	"dojo/when"
], function (when) {
	// module:
	//		server/routes/routes
	return {
		skip: true,
		"get": {
			handler: function (req, res, next) {
				if (!req.user) return res.Unauthorized();
				if (!req.params && !req.params[0]) return res.BadRequest();
				when(req.user.routes(req.params[0]), function(children) { res.send(children); }, next);
			},
			required: ['*']
		}
	};
});