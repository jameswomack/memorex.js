const URL = require('url')

function Keymaker (req, options) {
  if (!(this instanceof Keymaker))
    return new Keymaker(req, options)

  this.shouldParse = options.shouldParse
  this.sep = options.sep
  this.method = req.method.toUpperCase()
  this.bodyRange = options.bodyRange
  // In Express 4.x the url is ambigious based on where a router is mounted.  originalUrl will give the full Url
  this.url = req.originalUrl || req.url
  this.rawBody = req.body || { }
  // This enables you to clear cache entries that should be affected by later
  // calls such as POSTs, DELETEs and PUTs
  this.handleSideEffects = options.handleSideEffects
  this.cache = options.cache
}

Object.defineProperties(Keymaker.prototype, {
  processBody : {
    value : function (body) {
      return JSON.stringify(body)
              .substr(this.bodyRange[0], this.bodyRange[1])
    }
  },

  createKey : {
    value : function (method, body) {
      return `${this.url}${this.sep}${method}${this.sep}${this.processBody(body)}`
    }
  },

  valueOf  : {
    value : function () {
      const key = this.createKey(this.method, this.rawBody)
      this.handleSideEffects &&
        this.handleSideEffects(this.cache, this.method, (method) =>
          this.createKey(method, {}))

      // Remove querystring from key if the shouldParse option is truthy
      // This is (so far) only used in the case of JSON-P
      let parsedKey

      if (this.shouldParse && (parsedKey = URL.parse(key).pathname)) {
        return parsedKey
      }

      return key
    }
  },

  toString : {
    value : function () {
      return this.valueOf()
    }
  }
})

module.exports = Keymaker
