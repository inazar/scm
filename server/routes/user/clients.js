define([
	"dojo/_base/declare",
	"server/classes/User"
], function (declare, User) {
	// module:
	//		server/routes/user/clients
	return {
		"get": {
			handler: function (reg, res, next) {
				console.log("user/customers get");
				next();
			},
			optional: ['cid'],
			validate: {
				'cid': function (params) {
					console.log("user/customers validate", params.cid);
					return true;
				}
			}
		},
		"put": {
			handler: function (reg, res, next) {
				console.log("user/customers put");
				next();
			},
			required: ['cid'],
			validate: {
				'cid': function (params) {
					console.log("user/customers validate", params.cid);
					return true;
				}
			}
		},
		"post": {
			handler: function (reg, res, next) {
				console.log("user/customers post");
				next();
			}
		},
		"delete": {
			handler: function (reg, res, next) {
				console.log("user/customers delete");
				next();
			},
			required: ['cid'],
			validate: {
				'cid': function (params) {
					console.log("user/customers validate", params.cid);
					return true;
				}
			}
		}
	};
});