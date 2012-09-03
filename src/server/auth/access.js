// module:
//		server/auth/access

// summary:
//		This module defines access handling routines

define([
], function () {
	return {
		// template: Object
		//		access template object with node format:
		//	|	{
		//	|		name: String - the name of the node
		//	|		methods: Object? - array of supported methods
		//	|			{
		//	|				"get": Boolean,
		//	|				"put": Boolean,
		//	|				"post": Boolean,
		//	|				"delete": Booelan
		//	|			}
		//	|		hash: String? - if defined, node is shown in menu and routed to this hash
		//	|		children: Array? - array of child nodes
		//	|	}
		template: null
	};
});
