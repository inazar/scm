// module:
//		server/classes/Client
define([
	"../node/mongo",
	"../node/mongoose!Schema",
	"../node/mongoose!ObjectId",
	"../node/mongoose!Mixed",
	"./User",
	"./Relation",
	"dojo/Deferred",
	"dojo/when",
	"dojo/promise/all",
	"../auth/access"
], function (mongo, Schema, ObjectId, Mixed, User, Relation, Deferred, when, all, access) {

	// summary:
	//		Client database object

	// roles are subordinated from first to next
	var roles = ['vendor', 'supplier', 'retailer'];

	var ClientSchema = new Schema({
		name: { type: String, unique: true },
		secret: { type: String, select: false },
		role: { vendor: Boolean, supplier: Boolean, retailer: Boolean },	// client's role in the format { vendor: Boolean, supplier: Boolean, retailer: Boolean }
		// convenience methods to get/set Relation
		//		return Deferred which is resolved when an array is ready
		parent: Mixed,	// client's parents in the format { vendor: Promise, supplier: Promise, admin: Promise, user: Promise }
		child: Mixed	// client's children in the format { supplier: Promise, retailer: Promise, admin: Promise, user: Promise }
		// parents: Array of Client
		// children: Array of Client
	});

	function _verifyId (id, Obj) {
		var d = new Deferred();
		if (id instanceof Obj) d.resolve(id._id);
		else if (id instanceof ObjectId || typeof id === "string" || id instanceof String) {
			Obj.findById(id).exec(function (err, obj) {
				if (err) return d.reject(err);
				if (!obj) d.reject(new Error("cannot relate to inexistent "+Obj.name));
				else d.resolve(obj._id);
			});
		} else d.reject(new Error("relation requires "+Obj.name+" object or ObjectId"));
		return d;
	}

	// summary:
	//		getters/setters for client users and admins
	['user', 'admin'].forEach(function (role) {
		ClientSchema.virtual(role).get(function() {
			// summary:
			//		find all users/admins of this client
			// return: Deferred
			//		The deferred resolves to the array of client's users
			var d = new Deferred();
			Relation.find({ role: role, parent: this._id }).exec(function (err, relations) {
				if (err) d.reject(err);
				else d.resolve(relations.map(function (relation) { return relation.user; }));
			});
			return d.promise;
		}).set(function (uid) {
			// summary:
			//		add new user/admin of this client
			// uid: User || ObjectId || String
			//		If ObjectId or String provided, User is searched.
			// return: Deferred
			//		The deferred resolves to this client
			var d = new Deferred(), self = this;
			when(_verifyId(uid, User), function (uid) {
				Relation.find({ role: role, parent: this._id, user: uid }).exec(function (err, relation) {
					if (err) return d.reject(err);
					if (relation && relation.length) return d.resolve(self);
					Relation.create({ role: role, parent: self._id, user: uid }).exec(function (err) {
						if (err) d.reject(err);
						else d.resolve(self);
					});
				});
			}, d.reject);
			return d.promise;
		});

		['parent', 'child'].forEach(function(direction) {
			ClientSchema.virtual(direction+'.'+role).get(function() {
				var d = Deferred();
				Relation.find({child: this._id}, direction, function(err, crel) {
					if (err) return d.reject(err);
					Relation.find({role: role}, 'user').where(direction)['in'](crel.map(function(r) { return r[direction]; })).exec(function(err, uRel) {
						if (err) return d.reject(err);
						d.resolve(uRel.map(function (r) { return r.user; }));
					});
				});
				return d.promise;
			});
		});
	});

	// summary:
	//		getters/setters for client roles
	//			vendor, supplier, retailer
	roles.forEach(function (type) {
		ClientSchema.virtual(type).get(function () {
			return this.role[type];
		}).set(function (val) {
			this.role[type] = !!val;
		});
	});

	function _error(name, message) {
		var err = new Error(message);
		err.name = name;
		return err;
	}
	// call client.parents or client.children
	// to get an array of parents or children - full Client object
	ClientSchema.virtual('parents').get(function() {
		var d = Deferred();
		Relation.find({child: this.id}).populate('parent').exec(function(err, rel) {
			if (err) d.reject(err);
			else d.resolve(rel.map(function(r) { return r.parent; }));
		});
		return d.promise;
	});
	ClientSchema.virtual('children').get(function() {
		var d = Deferred();
		Relation.find({parent: this.id}).populate('child').exec(function(err, rel) {
			if (err) d.reject(err);
			else d.resolve(rel.map(function(r) { return r.child; }));
		});
		return d.promise;
	});

	// call supplier.parent.vendor or retailer.parent.supplier
	// to get an array of parents or add the new one (by assignment)
	// return promise (!!!)
	roles.slice(0, -1).forEach(function(role) {
		//		role denotes parent's role
		ClientSchema.virtual('parent.' + role).get(function () {
			// summary:
			//		find all client ids which have as child this client
			// return: Deferred
			//		The deferred resolves to array of parents
			var d = new Deferred();
			if (!this.role[roles[roles.indexOf(role) + 1]]) return d.reject(_error(this.name, "does not have parent "+role));
			// now we can search for the relations
			Relation.find({ role: role, child: this.id }).exec(function (err, relations) {
				if (err) d.reject(err);
				else d.resolve(relations.map(function (relation) { return relation.parent; }));
			});
			return d.promise;
		}).set(function (cid) {
			// summary:
			//		add new child relation from this to given client
			// cid: Client || ObjectId || String
			//		If ObjectId or String provided, Client is searched.
			// return: Deferred
			//		The deferred resolves to this client
			var d = new Deferred(), self = this;
			if (!this.role[roles[roles.indexOf(role) + 1]]) return d.reject(_error(this.name, "cannot have parent "+role));
			when(_verifyId(cid, Client), function(cid) {
				Relation.find({ role: role, parent: cid, child: this._id }).exec(function (err, relation) {
					if (err) return d.reject(err);
					if (relation && relation.length) return d.resolve(self);
					Relation.create({ role: role, parent: cid, child: self._id }).exec(function (err) {
						if (err) d.reject(err);
						else d.resolve(self);
					});
				});
			}, d.reject);
			return d.promise;
		});
	});

	// call vendor.child.supplier or supplier.child.retailer
	// to get an array of children or add the new one (by assignment)
	// return promise (!!!)
	roles.slice(1).forEach(function(role) {
		//		role denoted child's role
		ClientSchema.virtual('child.' + role).get(function () {
			// summary:
			//		find all client ids which have as parent this client
			// return: Deferred
			//		The deferred resolves to array of children
			var d = new Deferred();
			var prole = roles[roles.indexOf(role) - 1];
			if (!this.role[prole]) return d.reject(_error(this.name, "does not have child "+role));
			// now we can search for the relations
			Relation.find({ role: prole, parent: this.id }).exec(function (err, relations) {
				if (err) d.reject(err);
				else d.resolve(relations.map(function (relation) { return relation.child; }));
			});
			return d.promise;
		}).set(function (cid) {
			// summary:
			//		add new parent relation from this to given client
			// cid: Client || ObjectId || String
			//		If ObjectId or String provided, Client is searched.
			// return: Deferred
			//		The deferred resolves to this client
			var d = new Deferred(), self = this;
			var prole = roles[roles.indexOf(role) - 1];
			if (!this.role[prole]) return d.reject(_error(this.name, "cannot have child "+role));
			when(_verifyId(cid, Client), function (cid) {
				Relation.find({ role: prole, parent: this._id, child: cid }).exec(function (err, relation) {
					if (err) return d.reject(err);
					if (relation && relation.length) return d.resolve(self);
					Relation.create({ role: role, parent: self._id, child: cid }).exec(function (err) {
						if (err) d.reject(err);
						else d.resolve(self);
					});
				});
			}, d.reject);
			return d.promise;
		});
	});

	var _safe = [], _root = [];
	Object.keys(ClientSchema.paths).forEach(function(key) {
		var o = ClientSchema.paths[key].options;
		if (!o.auto) {
			_root.push(key);
			if (o.select !== false) _safe.push(key);
		}
	});

	ClientSchema.statics.filter = function(raw, root) {
		var obj = {}, i, key, sf = root ? _root : _safe;
		for (i=0; i<sf.length; i++) {
			key = sf[i];
			if (raw[key]) obj[key] = raw[key];
		}
		return obj;
	};

	ClientSchema.statics.isRole = function (role) {
		return roles.indexOf(role) >= 0;
	};

	ClientSchema.methods.canCreate = function (role) {
		var i = roles.indexOf(role);
		if (i <= 0) return false;
		return this[roles[i-1]];
	};

	ClientSchema.methods.isAdmin = function (uid, callback) {
		var d = new Deferred(), self = this;
		when(_verifyId, function (uid) {
			Relation.findOne({ role: 'admin', parent: self._id, user: uid}).exec(function (err, relation) {
				if (err) d.reject(err);
				else d.resolve(!!relation);
			}, d.reject);
		}, d.reject);
		if (callback) when(d, function (isAdmin) { callback(null, isAdmin); }, callback);
		return d.promise;
	};

	ClientSchema.statics.checkSecret = function (name, secret, callback) {
		// summary:
		//		Verify client secret
		// name: String
		//		client name
		// secret: String
		//		Client secret
		// callback: Function
		//		Callback receives Error object or null and Boolean as arguments
		var d = new Deferred();
		Client.findOne({name: name}, '+secret', function (err, client) {
			if (err) return d.reject(err);
			if (!client) d.resolve(false);
			else d.resolve(client.secret === secret);
		});
		if (callback) when(d, function (match) { callback(null, match); }, callback);
		return d.promise;
	};

	ClientSchema.methods.getClientPage = function (prefix, user) {
		var d = new Deferred(), client = this;
		when(access.get(prefix + this.id, user), function(access) {
			d.resolve({
				name: client.name,
				hash: prefix + client.id,
				access: access
			});
		}, d.reject);
		return d.promise;
	};

	ClientSchema.methods.getAdminSection = function (prefix, users, user) {
		// summary:
		//		Create route for this client
		// prefix: String
		//		Route hash prefix
		// users: Array
		//		Users objects to include to routes
		var d = new Deferred(), client = this, children = [];

		// list client admins
		var ud = new Deferred(), uds = [];
		children.push(ud);

		users.forEach(function(user) {
			uds.push(access.get(prefix + '/' + client.id + '/users/' + user.id, user));
		});

		all(uds).then(function(access) {
			var uchs = [];
			users.forEach(function (user, i) {
				uchs.push({
					name: user.name + ' (' + user.email + ')',
					hash: prefix + '/' + client.id + '/users/' + user.id,
					access: access[i]
				});
			});
			when(access.get(prefix + '/' + client.id + '/users'), function (access) {
				ud.resolve({
					name: 'users',
					hash: prefix + '/' + client.id + 'users',
					access: access,
					children: uchs.length ? uchs : false
				});
			}, ud.reject);
		}, ud.reject);

		// if client is vendor, list suppliers
		if (this.role && this.role.vendor) {
			var vd = new Deferred(), vds = [];
			children.push(vd);
			this.vendor.forEach(function(supplier) {
				vds.push(supplier.getClientPage(prefix + 'supplier/' + supplier.id + '/', user));
			});
			all(vds).then(function(suppliers) { 
				when(access.get(prefix + '/supplier', user), function (access) {
					vd.resolve({
						name: 'supplier',
						hash: prefix + 'supplier',
						access: access,
						children: suppliers.length ? suppliers : false
					});
				}, vd.reject);
			}, vd.reject);
		}

		// if client is supplier, list retailers
		if (this.role && this.role.supplier) {
			var sd = new Deferred(), sds = [];
			children.push(sd);
			this.supplier.forEach(function(retailer) {
				sds.push(retailer.getClientPage(prefix + 'retailer/' + retailer.id + '/', user));
			});
			all(sds).then(function(retailers) {
				when(access.get(prefix + '/retailer', user), function (access) {
					sd.resolve({
						name: 'retailer',
						hash: prefix + 'retailer',
						access: access,
						children: retailers.length ? retailers : false
					});
				}, sd.reject);
			}, sd.reject);
		}

		all(children).then(function(chs) {
			when(access.get(prefix + '/' + client.id, user), function (access) {
				d.resolve({
					name: client.name,
					hash: prefix + '/' + client.id,
					access: access,
					children: chs.length ? chs : false
				});
			}, d.reject);
		}, d.reject);

		return d.promise;
	};

	var Client = mongo.model('client', ClientSchema);
	Client.roles = roles;
	return Client;
});
