// module:
//		server/classes/Client
define([
	"../node/mongo",
	"../node/mongoose!Schema",
	"../node/mongoose!ObjectId",
	"dojo/Deferred",
	"dojo/when",
	"dojo/promise/all",
	"../auth/access"
], function (mongo, Schema, ObjectId, Deferred, when, all, access) {

	// summary:
	//		Client database object
	var ClientSchema = new Schema({
		name: { type: String, unique: true },
		secret: { type: String, select: false },
		admins: [{ type: ObjectId, ref: 'user', select: false }],
		vendor: [{ type: ObjectId, ref: 'client' }],	// refs to suppliers
		supplier: [{ type: ObjectId, ref: 'client' }],	// refs to retailers
		retailer: { type: Boolean, "default": false },
		redirect_uri: String
	});

	ClientSchema.statics.checkSecret = function (name, secret, callback) {
		// summary:
		//		Verify client secret
		// name: String
		//		client name
		// secret: String
		//		Client secret
		// callback: Function
		//		Callback receives Error object or null and Boolean as arguments
		if (!callback) return;
		Client.findOne({name: name}, '+secret', function (err, client) {
			if (err) return callback(err);
			if (!client) return callback(null, false);
			callback(null, client.secret === secret);
		});
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

		// if client is vendor, list suppliers
		if (this.vendor && this.vendor.length) {
			var vd = new Deferred(), vds = [];
			children.push(vd);
			this.vendor.forEach(function(supplier) {
				vds.push(supplier.getClientPage(prefix + 'supplier/' + supplier.id + '/', user));
			});
			all(vds).then(function(suppliers) { 
				when(access.get(prefix + 'supplier', user), function (access) {
					vd.resolve({
						name: 'supplier',
						hash: prefix + 'supplier',
						access: access,
						children: suppliers
					});
				}, vd.reject);
			}, vd.reject);
		}

		// if client is supplier, list retailers
		if (this.supplier && this.supplier.length) {
			var sd = new Deferred(), sds = [];
			children.push(sd);
			this.supplier.forEach(function(retailer) {
				sds.push(retailer.getClientPage(prefix + 'retailer/' + retailer.id + '/', user));
			});
			all(sds).then(function(retailers) {
				when(access.get(prefix + 'retailer', user), function (access) {
					sd.resolve({
						name: 'retailer',
						hash: prefix + 'retailer',
						access: access,
						children: suppliers
					});
				}, sd.reject);
			}, sd.reject);
		}

		all(children).then(function(chs) {
			when(access.get(prefix + '/' + client.id, user), function (access) {
				d.resolve({
					name: client.name,
					hash: prefix + '/!' + client.id,
					access: access,
					children: chs
				});
			}, d.reject);
		}, d.reject);

		return d.promise;
	};

	var Client = mongo.model('client', ClientSchema);
	return Client;
});
