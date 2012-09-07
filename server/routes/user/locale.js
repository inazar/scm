define([
	"dojo/_base/declare",
	"server/classes/User",
	"server/node/error",
	"app/config"
], function (declare, User, error, config) {
	// module:
	//		server/routes/user/locale
	return {
		"put": {
			handler: function (req, res, next) {
				var id = req.body && req.body.id, user = req.user;
				if (!user) return next(error.Unauthorized());
				if (!id || !(id in config.locales)) return next(error.BadRequest("unknown language"));
				user.locale = id;
				user.save(function(err) {
					if (err) next(err);
					else res.send(true);
				});
			}
		}
	}
});