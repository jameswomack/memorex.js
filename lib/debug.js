const name = require('paqman').packageJSON.name
const debug = require('debug')(name)

module.exports.name = name
module.exports.log  = debug
