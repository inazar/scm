define([
	"dojo/_base/declare",
	"server/classes/User"
], function (declare, User) {
	// module:
	//		server/routes/user/client
	return {
		"get": {
			handler: function (reg, res, next) {
				console.log("user/customer get");
				next();
			}
		}
	}
});