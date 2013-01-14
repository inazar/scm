// module:
//		server/classes/Log
define([
	"server/node/mongo",
	"server/node/mongoose!Schema",
	"server/node/mongoose!ObjectId",
	"dojo/node!util"
], function (mongo, Schema, ObjectId, util) {

	// summary:
	//		Log database object
	var LogSchema = new Schema({
		date: { type: Date, "default": Date.now },
		user: { type: ObjectId, ref: 'user' },
		model: { type: String },
		object: { type: ObjectId },
		action: { type: String },
		params: {},
		body: {}
	});

	LogSchema.statics.write = function (obj) {
		new Log(obj).save(function(err) { if (err) util.error("Error writing access log: "+err.message); });
	};

	var Log = mongo.model('log', LogSchema);
	return Log;
});

