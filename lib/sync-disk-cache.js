'use strict';

var path      = require('path');
var fs        = require('fs');
var readFile  = fs.readFileSync;
var writeFile = fs.writeFileSync;
var mkdirp    = require('mkdirp').sync;
var rimraf    = require('rimraf').sync;
var unlink    = fs.unlinkSync;
var chmod     = fs.chmodSync;
var tmpDir    = require('os').tmpDir();
var debug     = require('debug')('memorex.js');
var zlib      = require('zlib');

var mode = {
  mode: parseInt('0777', 8)
};

var CacheEntry = require('./cache-entry');
/*
 * @private
 * @method processFile
 * @param String filePath the path of the cached file
 * @returns CacheEntry an object representing that cache entry
 */
function processFile (filePath, fileStream) {
  return new CacheEntry(true, filePath, fileStream.toString());
}

/*
 * @private
 *
 * When we encounter a rejection with reason of ENOENT, we actually know this
 * should be a cache miss, so the rejection is handled as the CacheEntry.MISS
 * singleton is the result.
 *
 * But if we encounter anything else, we must assume a legitimate failure an
 * re-throw
 *
 * @method handleENOENT
 * @param Error reason
 * @returns CacheEntry returns the CacheEntry miss singleton
 */
function handleENOENT (reason) {
  if (reason && reason.code === 'ENOENT') {
    return CacheEntry.MISS;
  }

  throw reason;
}

var COMPRESSIONS = {
  deflate: {
    in  : zlib.deflateSync,
    out : zlib.inflateSync,
  },

  deflateRaw: {
    in  : zlib.deflateRawSync,
    out : zlib.inflateRawSync,
  },

  gzip: {
    in  : zlib.gzipSync,
    out : zlib.gunzipSync,
  },
};
/*
 *
 * @class Cache
 * @param {String} key the global key that represents this cache in its final location
 * @param {String} options optional string path to the location for the
 *                          cache. If omitted the system tmpdir is used
 */
function Cache (key, _) {
  var options = _ || {};
  this.tmpDir = options.location|| tmpDir;
  this.compression = options.compression;
  this.key = key || 'default-disk-cache';
  this.root = path.join(this.tmpDir, this.key);

  debug('new Cache { root: %s, compression: %s }', this.root, this.compression);
}

/*
 * @public
 *
 * @method clear
 */
Cache.prototype.clear = function () {
  debug('clear: %s', this.root);

  return rimraf(
    path.join(this.root)
  );
};

/*
 * @public
 *
 * @method has
 * @param {String} key the key to check existence of
 * @return {Boolean} does it exist
 */
Cache.prototype.has = function (key) {
  var filePath = this.pathFor(key);
  debug('has: %s', filePath);

  return fs.existsSync(filePath);
};

/*
 * @public
 *
 * @method get
 * @param {String} key they key to retrieve
 * @return {CacheEntry} - a representation of the content on disk
 */
Cache.prototype.get = function (key) {
  var filePath = this.pathFor(key);
  debug('get: %s', filePath);

  try {
    return processFile(filePath, this.decompress(readFile(filePath)));
  }

  catch (e) {
    return handleENOENT(e);
  }
};

/*
 * @public
 *
 * @method set
 * @param {String} key the key we wish to store
 * @param {String} value the value we wish the key to be stored with
 * @returns {String} the filePath
 */
Cache.prototype.set = function (key, value) {
  var filePath = this.pathFor(key);
  debug('set : %s', filePath);

  mkdirp(path.dirname(filePath), mode);
  writeFile(filePath, this.compress(value), mode);
  chmod(filePath, mode.mode);

  return filePath;
};

/*
 * @public
 *
 * @method remove
 * @param {String} key the key to remove from the cache
 */
Cache.prototype.remove = function (key) {
  var filePath = this.pathFor(key);
  debug('remove : %s', filePath);

  try {
    unlink(filePath);
  }

  catch (e) {
    handleENOENT(e);
  }
};

/*
 * @public
 *
 * @method pathFor
 * @param {String} key the key to generate the final path for
 * @returns {String} the path where the key's value may reside
 */
Cache.prototype.pathFor = function (key) {
  return path.join(this.root, key);
};

/*
 * @public
 *
 * @method decompress
 * @param {String} compressedValue
 * @returns decompressedValue
 */
Cache.prototype.decompress = function (value) {
  if (!this.compression) return value;

  return COMPRESSIONS[this.compression].out(value);
};

/*
 * @public
 *
 * @method compress
 * @param {String} value
 * @returns compressedValue
 */
Cache.prototype.compress = function (value) {
  if (!this.compression) return value;

  return COMPRESSIONS[this.compression].in(value);
};

module.exports = Cache;
