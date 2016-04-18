'use strict';

const URL   = require('url');
const _     = require('lodash');
const Cache = require('./lib/sync-disk-cache');
const areOn = require('./lib/boolean').areOn
const Debug = require('./lib/debug');

const debug = Debug.log;

function onlyWordChars (string) {
  return string.replace(/\W/gim, '')
}

function keymaker (req, options) {
  const body = req.body ? JSON.stringify(req.body).substr(options.bodyRange[0], options.bodyRange[1]) : ''
  // In Express 4.x the url is ambigious based on where a router is mounted.  originalUrl will give the full Url
  const url  = req.originalUrl || req.url
  const key  = `${url}${options.sep}${req.method.toUpperCase()}${options.sep}${body}`

  options.handleSideEffects &&
    options.handleSideEffects(options.cache, req.method.toUpperCase(), (method) =>
        `${url}${options.sep}${method}${options.sep}${JSON.stringify({})}`)

  // Remove querystring from key if the shouldParse option is truthy
  // This is (so far) only used in the case of JSON-P
  let parsedKey

  if (options.shouldParse && (parsedKey = URL.parse(key).pathname)) {
    return parsedKey
  }

  return key
}

function APICache (userOpts) {
  if (!(this instanceof APICache))
    return new APICache(userOpts)

  const userOptions = Object.freeze(_.defaults({
    enabled   : areOn([ userOpts.enabled, process.env.MEMOREX_ON ])
  }, userOpts, {
    appendKey : [ ],
    jsonp     : false,
    name      : Debug.name,
    directory : `${process.cwd()}/${onlyWordChars(Debug.name)}-cache`
  }))

  debug('userOptions: %o', userOptions)

  const cache = new Cache(userOptions.name, {
    location : userOptions.directory
  });

  let index = null;

  this.clear = function (target) {
    const group = index.groups[target];

    if (group) {
      debug('clearing group: %s', target);

      _.each(group, function (key) {
        debug('clearing key: %s', key);

        cache.remove(key);
        index.all = _.without(index.all, key);
      });

      delete index.groups[target];
    } else if (target) {
      debug('clearing key: %s', target);

      cache.remove(target);
      index.all = _.without(index.all, target);
      _.each(index.groups, function (group2, groupName) {
        index.groups[groupName] = _.without(group2, target);

        if (!index.groups[groupName].length) {
          delete index.groups[groupName];
        }
      });
    } else {
      debug('clearing entire index');

      cache.clear();
      this.resetIndex();
    }

    return this.getIndex();
  };

  this.getIndex = function (group) {
    if (group) {
      return index.groups[group];
    } else {
      return index;
    }
  };

  this.middleware = function middleware (middlewareOptions) {
    return function cacheRequest (req, res, next) {
      let cached;

      if (!userOptions.enabled || req.headers['x-apicache-bypass']) {
        if (req.headers['x-apicache-bypass']) {
          debug('bypass detected, skipping cache.');
        }

        return next();
      }

      // Remove querystring from key if jsonp option is enabled
      const key = keymaker(req, _.defaults({ }, middlewareOptions, {
        handleSideEffects : null,
        cache             : cache,
        shouldParse       : userOptions.jsonp,
        bodyRange         : [ 0, 48 ],
        sep               : ':$$$:'
      }))

      if (userOptions.appendKey.length > 0) {
        let appendKey = req;

        for (let i = 0; i < userOptions.appendKey.length; i++) { // eslint-disable-line
          appendKey = appendKey[userOptions.appendKey[i]];
        }

        key += '/appendKey=' + appendKey;
      }

      if (cache.has(key) && (cached = JSON.parse(cache.get(key).value))) {
        debug('returning cached version of "' + key + '"');

        res.statusCode = cached.status;
        res.set(cached.headers);

        if (userOptions.jsonp) {
          return res.jsonp(cached.body);
        }

        return res.send(cached.body);
      } else {
        debug('path "' + key + '" not found in cache');

        res.realSend = userOptions.jsonp ? res.jsonp : res.send;

        const methodName = userOptions.jsonp ? 'jsonp' : 'send';

        res[methodName] = function (a, b) {
          const responseObj = {
            headers: {
              'Content-Type': 'application/json; charset=utf-8'
            }
          };

          responseObj.status  = !_.isUndefined(b) ? a : _.isNumber(a) ? a : res.statusCode;
          responseObj.body    = !_.isUndefined(b) ? b : !_.isNumber(a) ? a : null;

          // last bypass attempt
          if (!cache.has(key) && !req.headers['x-apicache-bypass']) {
            if (req.apicacheGroup) {
              debug('group detected: ' + req.apicacheGroup);

              index.groups[req.apicacheGroup] = index.groups[req.apicacheGroup] || [];
              index.groups[req.apicacheGroup].push(key);
            }

            index.all.push(key);

            debug('adding cache entry for "%s"', key);

            _.each(['Cache-Control', 'Expires'], function (h) {
              const header = res.get(h);

              if (!_.isUndefined(header)) {
                responseObj.headers[h] = header;
              }
            });

            cache.set(key, JSON.stringify(responseObj));
          }

          return res.realSend(responseObj.body);
        };

        next();
      }
    };
  };

  this.resetIndex = function () {
    index = {
      all     :    [],
      groups  : {}
    };
  };

  // initialize index
  this.resetIndex();

  return this;
}

module.exports = APICache
