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
		},
		"put": {
			handler: function (reg, res, next) {
				console.log("user/customer put");
				next();
			},
			required: ['cid'],
			validate: {
				'cid': function (params) {
					console.log("user/customer validate", params.cid);
					return true;
				}
			}
		}
	};
});