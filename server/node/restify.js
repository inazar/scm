// module:
//		server/node/restify
define([
	"dojo/node!fs",
	"dojo/node!path",
	"dojo/Deferred",
	"dojo/promise/all",
	"dojo/when",
	"dojo/_base/lang"
], function(fs, path, Deferred, all, when, lang) {
	return function loader(app, root, prefix, parent, d) {
		prefix = prefix || '';
		d = d || new Deferred();
		fs.lstat(root, function(err, stat) {
			if (err) return d.reject(err);
			if (stat.isDirectory()) {
				fs.readdir(root, function (err, fileList) {
					if (err) return d.reject(err);
					var promises = {}, files = [], dirs = [];
					fileList.forEach(function(file) { promises[file] = new Deferred(); });
					all(promises).then(function () {
						// now files and dirs are sorted out
						var dirPromises = {}, filePromises = {}, routed = {}, children = [];
						dirs.forEach(function(dir) {
							var dd = dirPromises[dir] = new Deferred();
							when(dd, function (child) {
								children.push(child);
								routed[dir] = child;
							});
						});
						files.forEach(function(file) {
							var fd = filePromises[file] = new Deferred();
							when(fd, function (child) {
								var name = file.slice(0, -3);
								if (routed[name]) lang.mixin(routed[name], child);
								else children.push(child);
							});
						});
						function _getParams(required, optional) {
							// summary:
							//		Compose query parameters string - first required, then optional
							required = required || [];
							optional = optional || [];
							return optional.reduce(function(prev, curr) {
								return prev += '/:'+ curr+'?';
							}, required.reduce(function(prev, curr) {
								return prev += '/:'+curr;
							}, '')) || '/';
						}
						function _processValidators(obj, parent) {
							// summary:
							//		Create an array of middlewares to validate request based on parameters
							// obj: Object
							//		This object shall contain a method handler, arrays of required and 
							//		optional parameters and validation code per object. Validation code shall
							//		return either boolean or promise
							// parent: Array?
							//		Any other middlewares
							// returns: Array|null
							var validate = obj.validate,
								params = (obj.required || []).concat(obj.optional || []),
								processor = parent ? parent.slice(0) : [];
							if (obj.handler && params.length) {
								// any actions if handler exists and 
								processor.push(function (req, res, next) {
									var promises = [];
									params.forEach(function(param) {
										promises.push(!validate[param] || validate[param](req.params));
									});
									when(all(promises), function (data) {
										// proceed only if all checks are fulfilled
										var i;
										if (data.every(function(valid, index) { i = index; return valid; })) next();
										else res.Unathorized({name: "Invalid parameter", message: params[i]});
									}, function (err) { next(err); });
								});
								return processor;
							} else return parent ? parent : null;
						}
						when(all(dirPromises), function () {
							// process files
							files.forEach(function (file) {
								var name = file.slice(0, -3);
								require([path.join(root, file)], function (rest) {
									var access = {};
									["get", "put", "post", "delete"].forEach(function (m) {
										if (rest[m]) {
											var obj = rest[m],
												route = prefix + '/'+ name + _getParams(obj.required, obj.optional),
												validators = _processValidators(obj, parent),
												handler = validators && validators.length ? [validators] : [];
											if (obj.handler) handler.push(obj.handler);
											access.name = name;
											if (handler.length) {
												if (!access.methods) access.methods = {};
												access.methods[m] = false;
												console.log(m.toUpperCase(), route);
												app[m](route, handler);
											}
										}
									});
									filePromises[file].resolve(access);
								});							
							});
						}, d.reject);
						when(all(filePromises), function () { d.resolve({ name: "root", children: children }); }, d.reject);
						// process dirs
						dirs.forEach(function(dir) {
							if (files.indexOf(dir+'.js') >= 0) {
								require([path.join(root, dir+'.js')], function (file) {
									var getHandler = file["get"] || {};
									loader(app, path.join(root, dir), prefix+'/'+dir+_getParams((getHandler.required || []).concat(getHandler.optional || [])), (_processValidators(getHandler, parent) || ''), dirPromises[dir]);
								});
							} else loader(app, path.join(root, dir), prefix+'/'+dir, parent, dirPromises[dir]);
						});
					}, d.reject);
					// sort files and dirs
					fileList.forEach(function (file) {
						fs.stat(path.join(root, file), function (err, stat) {
							if (err) return promises[file].reject(err);
							if (stat.isDirectory()) dirs.push(file);
							else if (file.slice(-3) === '.js') files.push(file);
							promises[file].resolve();
						});
					});
				});
			} else d.reject(new Error("Can load routes only from directory"));
		});
		return d.promise;
	}
});