// module:
//		server/node/restify
define([
	"dojo/node!fs",
	"dojo/node!path",
	"server/node/utils",
	"dojo/Deferred",
	"dojo/promise/all",
	"dojo/when",
	"dojo/_base/lang",
	"../auth/access",
	"./error"
], function(fs, path, utils, Deferred, all, when, lang, Access, error) {
	var loader = function (app, root, prefix, hash, parent, d) {
		prefix = prefix || ''; hash = hash || '';
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
								if (!child.skip) {
									if (routed[name]) lang.mixin(routed[name], child);
									else children.push(child);
								}
							});
						});
						var _getParams = Access.getParams = function (required, optional) {
							// summary:
							//		Compose query parameters string - first required, then optional
							required = required || [];
							optional = optional || [];
							return optional.reduce(function(prev, curr) {
								return prev += '/:'+ curr+'?';
							}, required.reduce(function(prev, curr) {
								return prev += (curr === '*' ? '/' : '/:') + curr;
							}, '')) || '/';
						};
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
							var validate = obj.validate || {},
								params = (obj.required || []).concat(obj.optional || []),
								processor = parent ? parent.slice(0) : [];
							// empty validator is run for all handlers
							params.unshift('');
							params.forEach(function(param) {
								if (validate[param]) processor.push(validate[param]);
							});
							return processor.length ? processor : null;
						}
						all(dirPromises).then(function () {
							// process files
							files.forEach(function (file) {
								var name = file.slice(0, -3), access = { name: name, hash: hash + '/' + name, methods: {} };
								require([path.join(root, file)], function (rest) {
									["get", "put", "post", "delete"].forEach(function (m) {
										if (rest[m]) {
											var obj = rest[m],
												route = prefix + '/'+ name + _getParams(obj.required, obj.optional),
												params = (obj.required || []).concat(obj.optional || []),
												validators = _processValidators(obj, parent), handler = [];
											params.unshift('');
											if (validators) {
												// handler shall validate on request
												handler.push(function (req, res, next) {
													var promises = [];
													validators.forEach(function (validator) {
														promises.push(validator(req.params, req.user, app.get('env') === "development"));
													});
													all(promises).then(function (data) {
														// proceed only if all checks are fulfilled
														var i;
														if (data.every(function(valid, index) { i = index; return valid; })) next();
														else res.Unathorized({name: "Invalid parameter", message: params[i]});
													}, function (err) { next(err); });
												});
												// access validator validate when route is calculated
												Access.routers[m].register(route, function (evt) {
													var promises = [], vd = new Deferred();
													validators.forEach(function (validator) {
														promises.push(validator(evt.params, evt.user, app.get('env') === "development"));
													});
													all(promises).then(function (valids) {
														vd.resolve(valids.every(function(valid) { return valid; }));
													}, vd.reject);
													return vd.promise;
												});
											}
											access.methods[m] = undefined;

											if (obj.handler) handler.push(lang.hitch(rest, obj.handler));
											if (handler.length) {
												if (app.get('env') === "development") {
													utils.info('#bold['+m.toUpperCase()+'] '+route.replace(/:(\w+)/g, '#blue[:]#cyan[$1]').replace(/(\?|\*)/g, '#yellow[$1]'));
												}
												app[m](route, handler);
											}
										}
									});
									if (rest.skip) access.skip = rest.skip;
									filePromises[file].resolve(access, _getParams);
								});
							});
						}, d.reject);
						all(filePromises).then(function () { d.resolve({ name: "root", children: children }); }, d.reject);
						// process dirs
						dirs.forEach(function(dir) {
							if (files.indexOf(dir+'.js') >= 0) {
								require([path.join(root, dir+'.js')], function (file) {
									var getHandler = file["get"] || {};
									loader(app, path.join(root, dir), prefix+'/'+dir+_getParams((getHandler.required || []).concat(getHandler.optional || [])), hash+'/'+dir, (_processValidators(getHandler, parent) || ''), dirPromises[dir]);
								});
							} else loader(app, path.join(root, dir), prefix+'/'+dir, hash+'/'+dir, parent, dirPromises[dir]);
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
	};

	loader.extend = function (Model, self, req, res, next) {

		var restrict = self && self.restrict, select = self && self.select;
		// if restricted with empty object or array - nothing to do. To get unrestricted pass null or false
		if (restrict && (restrict.length === 0 || !Object.keys(restrict).length)) return res.send([]);

		var d = new Deferred(),
			query = lang.mixin({}, req.query, self && self.query),
			range = req.header('Range'),
			sort = query.sort,
			Query, limit, count, skip;

		if (sort) {
			sort = sort.split(',').map(function (field) {
				return (field[0] === ' ' || field[0] === '+') ? field.slice(1) : field;
			}).join(' ');
			delete query.sort;
		}
		Query = Model.find(query, select);
		if (restrict) {
			if (restrict.length) Query = Query.where("_id")['in'](restrict);
			else {
				Object.keys(restrict).forEach(function (key) {
					var r = restrict[key];
					Query = Query.where(key)['in'](r.length ? r : [r]);
				});
			}
		}
		if (range && typeof range === "string" && (range = range.match(/items=(\d*)-(\d*)/))) {
			range.splice(0, 1);
			Model.count(query, function(err, c) {
				if (err) return d.reject(err);
				count = c;
				if (range[0] && (skip = Number(range[0]))+1) {
					// lower is set so expect upper
					if (range[1] && (range[1] = Number(range[1]))) {
						if ((limit = (range[1] - range[0] + 1)) > 0) {
							if (sort) Query = Query.sort(sort);
							d.resolve(Query.skip(skip).limit(limit));
						} else d.reject(error.create('BadRequest'));
					} else d.reject(error.create('BadRequest'));
				} else d.reject(error.create('BadRequest'));
			});
		} else d.resolve(sort ? Query.sort(sort) : Query);
		when(d, function(q) {
			q.exec(function(err, objs) {
				if (err) return next(err);
				if (count) {
					res.set('Content-Range', 'items '+skip+'-'+(skip+objs.length-1)+'/'+count);
				}
				res.send(objs.map(function(o) { return o.toJSON(); }));
			});
		}, next);
	};

	return loader;
});