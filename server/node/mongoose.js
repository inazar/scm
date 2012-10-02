define(["dojo/node!mongoose"], function (mongoose) {
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
					if (mongoose.Schema.Types[id]) load(mongoose.Schema.Types[id]);
					else throw new Error("Unsupported mongoose object '"+id+"'");
					break;
			}
		}
	};
});
