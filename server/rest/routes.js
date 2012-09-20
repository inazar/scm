define([
	"dojo/_base/declare",
	"server/classes/User",
	"server/auth/access",
	"server/node/error"
], function (declare, User, access, error) {
	// module:
	//		server/routes/routes
	return {
		skip: true,
		"get": {
			handler: function (req, res, next) {
				if (!req.user) return res.Unauthorized();
				var hash = (req.params && req.params[0] ? '/'+req.params[0] : '').split('/').slice(1), k, i, c, o, a = req.user.routes || {};
				for (k = 0; k<hash.length; k++) {
					if (hash[k][0] === '!') continue;
					if (c = a.children) {
						for(i=0; i<c.length; i++) {
							if (c[i].name === hash[k]) {
								a = c[i];
								break;
							}
						}
					}
					if (!c || i === c.length) return next(error.BadRequest(hash.join('/')));
				}
				c = [];	a = a.children;
				if (a) {
					for (i=0; i<a.length; i++) {
						o = {};
						for (k in a[i]) o[k] = a[i][k];
						if (o.children) o.children = true;
						c.push(o);
					}
				}
				res.send(c);
			},
			required: ['*']
		}
	};
});