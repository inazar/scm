/**
 * This file is used to reconfigure parts of the loader at runtime for this application. We've put this extra
 * configuration in a separate file, instead of adding it directly to index.html, because it contains options that
 * can be shared if the application is run on both the client and the server.
 *
 * If you aren't planning on running your app on both the client and the server, you could easily move this
 * configuration into index.html (as a dojoConfig object) if it makes your life easier.
 */
require({
	// The base path for all packages and modules. If you don't provide this, baseUrl defaults to the directory
	// that contains dojo.js. Since all packages are in the root, we just leave it blank. (If you change this, you
	// will also need to update `app.profile.js`).
	baseUrl: '',
	// An array of resource paths which should load immediately once Dojo has loaded
	deps: [],
	// Amount of time to wait before signaling load timeout for a module, 0 = wait forever
	waitSeconds: 5,
	// When isDebug is “false” (default) some additional debugging information like warning
	// when using deprecated or experimental code are not printed out.
	isDebug: true,
	async: true,
	ioPublish: true,

	// A list of packages to register. Strictly speaking, you do not need to register any packages,
	// but you can't require "app" and get app/main.js if you do not register the "app" package (the loader will look
	// for a module at <baseUrl>/app.js instead). Unregistered packages also cannot use the `map` feature, which
	// might be important to you if you need to relocate dependencies. TL;DR, register all your packages all the time:
	// it will make your life easier.
	packages: [
		// If you are registering a package that has an identical name and location, you can just pass a string
		// instead, and it will configure it using that string for both the "name" and "location" properties. Handy!
		{ name: 'dojo', location: 'lib/dojo', destLocation: 'lib/dojo' },
		{ name: 'dijit', location: 'lib/dijit', destLocation: 'lib/dijit' },
		{ name: 'dojox', location: 'lib/dojox', destLocation: 'lib/dojox' },
		{ name: 'dgrid', location: 'lib/dgrid', destLocation: 'lib/dgrid' },
		{ name: 'put-selector', location: 'lib/put-selector', destLocation: 'lib/put-selector' },
		{ name: 'xstyle', location: 'lib/xstyle', destLocation: 'lib/xstyle' },
		'app', 'client'
	]
// Require `app`. This loads the main application module, `app/main`, since we registered the `app` package above.
}, [ 'dojo/has', 'require', 'dojo/_base/config', 'app/config' ], function (has, require, config, appConfig) {
	if (has('host-node')) require({
		ioPublish: false,
		packages: [
			{ name: 'dojo', location: 'lib/dojo', destLocation: 'lib/dojo' },
			'app', 'server'
		]
	}, ['server']);
	else {
		require(['dojo/domReady!'], function() {
			// now we run client
			switch (window.location.pathname) {
				case appConfig.urls.register:
					require(['app/handlers/register']);
					break;
				case appConfig.urls.login:
					require(['app/handlers/login'], function(login) { login(); });
					break;
				case appConfig.urls.base:
					require(['app/handlers/index']);
					break;
				default:
					break;
			}
		});
	}
});