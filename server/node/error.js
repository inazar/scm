// module:
//		serve/node/error

define(["dojo/node!express/lib/response", "app/config"], function(Response, config) {

	var errors = config.errors;

	function register() {
		function _register(type) {
			Response[type] = function (msg, info) {
				msg = msg || type;
				this.send(errors[type], { name: "Error", message: msg });
			};
		}
		for(var k in errors) _register(k);
	}

	var create = register.create = function (status, msg, name) {
		if (typeof status === "string") status = errors[status] || 500;
		var error = new Error(msg);
		error.status = status;
		if (name) error.name = name;
		return error;
	};

	function _createError(type) {
		register[type] = function (msg) {
			return create(type, msg, type);
		};
	}
	for (var k in errors) _createError(k);

	Response.flash = function(status, message) {
		this.req.session.flash = {status: status, message: message};
		return this;
	};

	return register;
});
