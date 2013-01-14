// module:
//		server/config/mail

define({
	method: process.env['DOTCLOUD_PROJECT'] ? 'smtp' : 'dev', // can be smtp or dev
	from: "SCM server <nivanenko@gmail.com>",
	conf: {
		host: "localhost"
	}
});