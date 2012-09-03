// module:
//		serve/node/error

define(["dojo/node!express/lib/response"], function(Response) {

	var errors = {
		BadRequest: 400,
		Unauthorized: 401,
		PaymentRequired: 402,
		Forbidden: 403,
		NotFound: 404,
		MethodNotAllowed: 405,
		NotAcceptable: 406,
		InternalError: 500,
		NotImplemented: 501,
		BadGateway: 502,
		ServiceUnavailable: 503
	};

	function register() {
		for(var k in errors) {
			(function (type) {
				Response[type] = function (msg, info) {
					msg = msg || type;
					this.send(errors[type], { name: "Error", message: msg });
				}
			})(k);
		}
	}

	var create = register.create = function (status, msg, name) {
		if (typeof status === "string") status = errors[status] || 500;
		var error = new Error(msg);
		error.status = status;
		if (name) error.name = name;
		return error;
	};

	for (var k in errors) {
		(function (type) {
			register[type] = function (msg) {
				return create(type, msg, type);
			}
		})(k);
	}

	return register;
});
