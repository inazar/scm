define(function () {
	return {
		uid: function (len) {
			var buf = [], i,
				chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
				charlen = chars.length;
			for (i=0; i<len; i++) buf.push(chars[Math.floor(Math.random()*charlen)]);
			return buf.join('');
		}
	};
});
