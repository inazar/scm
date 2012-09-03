define([
	"dojo/_base/declare",
	"server/classes/User"
], function (declare, User) {
	// module:
	//		server/routes/user
	return {
		"get": {
			handler: function (reg, res, next) {
				console.log("user get");
				next();
			},
			optional: ['id'],
			validate: {
				'id': function (params) {
					console.log("user validate", params.id);
					return true;
				}
			}
		},
		"put": {
			handler: function (reg, res, next) {
				console.log("user put");
				next();
			},
			required: ['id'],
			validate: {
				'id': function (params) {
					console.log("user validate", params.id);
					return true;
				}
			}
		},
		"post": {
			handler: function (reg, res, next) {
				console.log("user post");
				next();
			}
		},
		"delete": {
			handler: function (reg, res, next) {
				console.log("user delete");
				next();
			},
			required: ['id'],
			validate: {
				'id': function (params) {
					console.log("user validate", params.id);
					return true;
				}
			}
		}
	};
});