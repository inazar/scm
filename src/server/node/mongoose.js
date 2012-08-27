define(["dojo/_base/lang", "dojo/node!mongoose", "./mongo"], function (lang, mongoose, mongo) {
	// summary:
	//		This AMD plugin module allows loading mongoose classes
	//	|	require("server/node/mongoose!ObjectId", function(ObjectId) {});
	return {
		load: function (/*string*/ id, /*Function*/ require, /*Function*/ load) {
			switch (id) {
				case "Schema":
					load(mongoose.Schema);
					break;
				default:
					if (mongoose.Schema[id]) load(mongoose.Schema[id]);
					else throw new Error("Unsupported mongoose object '"+id+"'");
					break;
			}
		}
	};
});
