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

	var Relation = mongo.model('relation', RelationSchema);
	return Relation;
});