// module:
//		server/classes/Product
define([
	"server/node/mongo",
	"server/node/mongoose!Schema",
	"server/node/mongoose!ObjectId",
	"server/config/env",
	"dojo/Deferred",
	"dojo/when",
	"dojo/promise/all",
	"server/auth/access",
	"server/node/error"
], function (mongo, Schema, ObjectId, env, Deferred, when, all, access, error) {

	// summary:
	//		Product database object
	// description:
	//		Products operated by the system. Each product is linked to a vendor which supplies it
	//		and is indexed by vendor's code. This table contains product properties, images and supply lead time.
	var ProductSchema = new Schema({
		owner: { type: ObjectId, ref: 'client' },		// the client (vendor) which supplied product
		code: { type: String, required: true },			// vendor code for the product
		name: { type: String },							// product name
		description: { type: String },					// product description
		category: [{ type: ObjectId, ref: 'category' }],// product category(ies)
		properties: {},									// product properties according to the categories
		images: [{ type: ObjectId, ref: 'image' }],		// product images
		lead: { type: Number }							// product supply lead time. Inited from category
	});

	var _safe = [], _root = [];
	Object.keys(ProductSchema.paths).forEach(function(key) {
		var o = ProductSchema.paths[key].options;
		if (!o.auto) {
			_root.push(key);
			if (o.select !== false) _safe.push(key);
		}
	});

	ProductSchema.statics.filter = function(raw, root) {
		var obj = {}, i, key, sf = root ? _root : _safe;
		for (i=0; i<sf.length; i++) {
			key = sf[i];
			if (raw[key] !== undefined) obj[key] = raw[key];
		}
		return obj;
	};
	var Product = mongo.model('product', ProductSchema);
	return Product;
});

