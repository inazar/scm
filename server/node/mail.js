define(["dojo/node!util", "dojo/node!mail", "../config/mail"], function(util, mail, config){
// module:
//		server/node/mail

	// summary:
	//		Handle email delivery
	if(config.method == "smtp") {
		var mail = mail.Mail(config.conf);

		return function(destination, subject, body, callback) {
			/* Send an email.
			 *
			 * Arguments:
			 *   - destination: email address of destination
			 *   - subject: email subject.
			 *   - body: what's in the email.
			 *
			 */
			mail.message({
				from: config.from,
				to: typeof destination === "string" ? [destination] : destination,
				subject: subject
			}).body(body).send(function(err) {
				if (err) callback && callback(err) || util.error(err);
				else callback && callback();
			});
		};
	} else if(config.method == "dev") {
		return function(destination, subject, body, callback) {
			util.log('Send email to ' + destination + ': ' + subject);
			util.log(body + '\n-------------\n');
			callback && callback();
		};
	}
});
