define(["dojo/node!util", "dojo/node!email", "../config/mail"], function(util, mail, config){
// module:
//		server/node/mail

	// summary:
	//		Handle email delivery
	if(config.method == "smtp") {
		var Email = mail.Email;
		mail.from = config.from;

		return function(destination, subject, body, callback) {
			// summary:
			//		Send an email.
			// destination:
			//		email address of destination
			// subject:
			//		email subject.
			// body:
			// 		what's in the email.
			new Email({
				to: destination,
				subject: subject,
				body: body
			}).send(function(err) {
				if (err) {
					if (callback) callback(err); else util.error(err);
				} else {
					if (callback) callback();
				}
			});
		};
	} else if(config.method == "dev") {
		return function(destination, subject, body, callback) {
			util.log('Send email to ' + destination + ': ' + subject);
			util.log(body + '\n-------------\n');
			if (callback) callback();
		};
	}
});
