define([
	"dojo/_base/lang",
	"server/rest/user"
], function (lang, User) {
	var obj = {};
	return lang.mixin(obj, User, {query: {root: true}, select: '+root'});
});