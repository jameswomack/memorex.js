'use strict';

const debug = require('debug')('memorex.js')
const _     = require('lodash')

const Memorex = require('../../../../')
const memrx   = Memorex({
  enabled : true,
  name    : 'memorex:tests:integration'
}).middleware


let tortas = {
  milanesa : 'good',
  tijuana  : 'good'
}


module.exports.memrx = memrx.bind(null, {
  handleSideEffects : (cache, method, urlPathTemplate) => {
    return method === 'POST' && cache.remove(urlPathTemplate('GET'))
  }
})

module.exports.getTortas = function (req, res) {
  return res.send(tortas)
}

module.exports.postTortas = function (req, res) {
  if (!req.body || typeof req.body.tortas !== 'object') return res.send(tortas)

  debug('%s', 'Sending reduced tortas')

  _.assign(tortas, req.body.tortas)

  return res.send(tortas)
}

module.exports.log = listener => {
  const Address = listener.address()
  return debug('Go! [%s, %d]', Address.address, Address.port)
}
