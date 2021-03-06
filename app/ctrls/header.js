// module:
//		app/ctrls/header
define([
	"app/ctrls/translate!index",
	"dojo/i18n!app/nls/index",
	"dojo/_base/declare",
	"dojo/_base/config",
	"dojo/request",
	"client/widgets/header"
], function (__, nls, declare, dojoConfig, request, HeaderWidget) {
	// summary:
	//		declare header pane which monitors page title, language and provide some basic controls like logout
	return declare([HeaderWidget], {
		nls: nls,
		setLocale: function(id) {
			request.put('/user/'+dojoConfig.user+'/locale/', { data: {id: id} }).then(function () {
				document.location.reload();
			});
		}
	});
});
