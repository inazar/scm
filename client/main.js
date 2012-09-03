define([], function () {
	var app = {};

	require([ 'client/Dialog', 'dojo/domReady!' ], function (Dialog) {
		app.dialog = new Dialog().placeAt(document.body);

		// It is important to remember to always call startup on widgets after you have added them to the DOM.
		// It will not hurt if you do it twice, but things will often not work right if you forget to do it.
		app.dialog.startup();

		// And now we just show the dialog to demonstrate that, yes, the example app has loaded successfully.
		app.dialog.show();
	});
});
