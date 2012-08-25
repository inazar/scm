define(["dojo/node!util", "dojo/_base/lang", "dojo/node!express", "./mongo"], function(util, lang, express, mongo){
	// module:
	//		server/node/session

	// summary:
	//		Implement persistent session storage
	var Session = mongo.model('session', new mongo.Schema({
			_sid: { type: String, index: { unique: true } },
			access: { type: Number },
			ttl: { type : Number },
			data: {}
		})),
		Store = express.session.Store,
		Cookie = express.session.Cookie,
		ExpressSession = express.session.Session;

	function SessionStore(options) {
		options = options || {};
		Store.call(this, options);

		// Default reapInterval to 1 minute
		this.reapInterval = options.reap || 60000;
		this.ttl = options.ttl || 600000;

		if (this.reapInterval) {
			setInterval(function(self){
				self.reap(self.ttl);
			}, this.reapInterval, this);
		}
	}

	SessionStore.prototype.__proto__ = Store.prototype;

	SessionStore.prototype.reap = function(ms) {
		var thresh = Number(new Date(Number(new Date) - ms));
		Session.remove({ access : { "$lt" : thresh }}, function(err) {
			if (err) util.error("Failed to clean up sessions:", err.message);
		});
	};

	SessionStore.prototype.set = function(sid, sess, callback) {
		Session.findOne({ _sid: sid }, function(err, session) {
			if (err) callback && callback(err);
			else {
				if (session) {
					session.data = sess;
				} else {
					session = new ExpressSession({_sid: sid, data: sess});
				}
				session.access = (new Date()).getTime();
				session.save(callback);
			}
		});
	};

	SessionStore.prototype.get = function(sid, callback) {
		Session.findOne({ _sid: sid }, function(err, sess) {
			if (err) callback(err);
			else callback(null, (sess && sess.data) || {});
		});
	};

	SessionStore.prototype.destroy = function(sid, callback) {
		Session.remove({ _sid: sid }, callback);
	};

	SessionStore.prototype.createSession = function(req, sess){
		var expires = sess.cookie ? sess.cookie.expires : null,
			original = sess.cookie ? sess.cookie.originalMaxAge : null;
		sess.cookie = new Cookie(sess.cookie);
		if ('string' == typeof expires) sess.cookie.expires = new Date(expires);
		sess.cookie.originalMaxAge = original;
		req.session = new ExpressSession(req, sess);
		return req.session;
	};

	return SessionStore;
});
