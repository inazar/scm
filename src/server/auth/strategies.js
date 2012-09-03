// module:
//		server/auth/strategies

define([
	"dojo/node!passport-local",
	"dojo/node!passport-http",
	"dojo/node!passport-oauth2-client-password",
	"dojo/node!passport-http-bearer",
	"../classes/User",
    "../classes/Client",
    "../classes/Token"
], function (local, http, client, bearer, User, Client, Token) {
	// summary:
	//		This module defines authentication strategies for oauth2

	return function(passport) {
		/**
		 * LocalStrategy
		 *
		 * This strategy is used to authenticate users based on a username and password.
		 * Anytime a request is made to authorize an application, we must ensure that
		 * a user is logged in before asking them to approve the request.
		 */
		passport.use(new local.Strategy({usernameField: 'email'}, User.checkPassword));
		passport.serializeUser(function(user, next) { next(null, user.get('_id')); });
		passport.deserializeUser(function(id, next) { User.findById(id, next); });

		/**
		 * BasicStrategy & ClientPasswordStrategy
		 *
		 * These strategies are used to authenticate registered OAuth clients.	They are
		 * employed to protect the `token` endpoint, which consumers use to obtain
		 * access tokens. The OAuth 2.0 specification suggests that clients use the
		 * HTTP Basic scheme to authenticate. Use of the client password strategy
		 * allows clients to send the same credentials in the request body (as opposed
		 * to the `Authorization` header). While this approach is not recommended by
		 * the specification, in practice it is quite common.
		 */
		passport.use(new http.BasicStrategy(Client.checkSecret));
		passport.use(new client.Strategy(Client.checkSecret));

		/**
		 * BearerStrategy
		 *
		 * This strategy is used to authenticate users based on an access token (aka a
		 * bearer token). The user must have previously authorized a client
		 * application, which is issued an access token to make requests on behalf of
		 * the authorizing user.
		 */
		passport.use(new bearer.Strategy(Token.checkScope));
	};
});