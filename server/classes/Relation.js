// module:
//		server/classes/Client
define([
	"../node/mongo",
	"../node/mongoose!Schema",
	"../node/mongoose!ObjectId",
	"dojo/Deferred",
	"dojo/when",
	"dojo/promise/all"
], function (mongo, Schema, ObjectId, Deferred, when, all) {
	// summary:
	//		Clients relations
	var RelationSchema = new Schema({
		// summary:
		//		Schema holds object relations.
		//	client <-> client
		//		vendor, supplier (retailer does not have children)
		//	client <-> user
		//		user, admin
		role: { type: String, index: true, required: true }, // the parent's role
		parent: { type: ObjectId, ref: 'client', index: true, required: true },
		child: { type: ObjectId, ref: 'client', index: true },
		user: { type: ObjectId, ref: 'user', index: true }
	});

	RelationSchema.pre('save', function (next) {
		if (!this.child && !this.user) next(new Error("Relation require a subordinate!"));
		else next();
	});

	RelationSchema.statics.verifyId = function  (id, Obj) {
		var d = new Deferred();
		if (id instanceof Obj) d.resolve(id._id);
		else if (id instanceof ObjectId || typeof id === "string" || id instanceof String) {
			Obj.findById(id).exec(function (err, obj) {
				if (err) return d.reject(err);
				if (!obj) d.reject(new Error("cannot relate to inexistent "+Obj.name));
				else d.resolve(obj._id);
			});
		} else d.reject(new Error("relation requires "+Obj.name+" object or ObjectId"));
		return d.promise;
	};

	RelationSchema.statics.is = function (role, parent, child) {
		var criteria = {role: role, parent: parent}, d = new Deferred();
		if (role === 'user' || role === 'admin') criteria.user = child;
		else criteria.child = child;
		Relation.findOne(criteria).exec(function(err, rel) {
			if (err) return d.reject(err);
			d.resolve(!!rel);
		});
		return d.promise;
	};

	RelationSchema.statics.relate = function (role, pid, cid) {
		if (!(pid instanceof ObjectId || typeof pid === "string")) pid = pid.id;
		if (!(cid instanceof ObjectId || typeof cid === "string")) cid = cid.id;
		var d = new Deferred(), obj = {role: role, parent: pid};
		obj[(role === "user" || role === "admin") ? "user" : "child"] = cid;
		Relation.create(obj, function (err) {
			if (err) d.reject(err);
			else d.resolve();
		});
		return d.promise;
	};

	var Relation = mongo.model('relation', RelationSchema);
	return Relation;
});