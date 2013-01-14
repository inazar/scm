define([
	"app/main",
	"dojo/node!util",
	"dojo/when",
	"server/classes/Log"
], function (app, util, when, Log) {
	return {
		ansicodes: {
			'reset': '\033[0m',
			'bold': '\033[1m',
			'italic': '\033[3m',
			'underline': '\033[4m',
			'blink': '\033[5m',
			'black': '\033[30m',
			'red': '\033[31m',
			'green': '\033[32m',
			'yellow': '\033[33m',
			'blue': '\033[34m',
			'magenta': '\033[35m',
			'cyan': '\033[36m',
			'white': '\033[37m'
		},
		ansify: function(str){
			var tag = /#([a-z]+)\[|\]/;
			var cstack = [];
			
			while (tag.test(str)) {
				var matches = tag.exec(str);
				var orig = matches[0];
				if (orig == ']')
					cstack.pop();
				else {
					var name = matches[1];
					if (name in this.ansicodes) {
						var code = this.ansicodes[name];
						cstack.push(code);
					}
				}
				str = str.replace(orig, this.ansicodes.reset + cstack.join(''));
			}
			return str;
		},
		uid: function (len) {
			var buf = [], i,
				chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
				charlen = chars.length;
			for (i=0; i<len; i++) buf.push(chars[Math.floor(Math.random()*charlen)]);
			return buf.join('');
		},
		encode: function (obj) {
			return new Buffer(JSON.stringify(obj)).toString('base64');
		},
		decode: function (str) {
			try {
				return JSON.parse(new Buffer(str, 'base64').toString('ascii'));
			} catch (e) {
				return null;
			}
		},
		_forward: function(method, args){
			args = Array.prototype.slice.call(args);
			if (args.length > 0) args[0] = this.ansify(args[0]);
			console[method].apply(console, args);
		},
		log: function () {
			this._forward("log", arguments);
		},
		info: function () {
			this._forward("info", arguments);
		},
		warn: function () {
			this._forward("warn", arguments);
		},
		error: function () {
			this._forward("error", arguments);
		},
		validate: function(path, method, params, user, result, log) {
			if (log) {
				var self = this, p = {}, i;
				for (i in params) p[i] = params[i];
				when(result, function (res) {
					self.info("#yellow[VALIDATE](#"+(res ? "green" : "red")+"[\u25CF]) #cyan[/%s]: #bold[%s] for #green['%s'], params: %s", path, method, user.id, util.inspect(params, false, 3, true).replace(/\n/g,""));
				});
			}
			return result;
		},
		access: function (rowId, user, model, action, params, body) {
			Log.write({
				user: user.id,
				model: model,
				object: rowId,
				action: action,
				params: params,
				body: body
			});
			return row;
		}
	};
});
