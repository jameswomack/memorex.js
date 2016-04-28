const pkg   = require('paqman').packageJSON
const name  = pkg ? pkg.name : 'anonymous'
const debug = require('debug')(name)

module.exports.name = name
module.exports.log  = debug
