'use strict';

const Restify = require('restify')
const server  = Restify.createServer()

const bodyParser = Restify.plugins.bodyParser

const Shared = require('./lib/shared')

server.use(bodyParser())

server.get( '/api/tortas', Shared.memrx(), Shared.getTortas )
server.post('/api/tortas', Shared.memrx(), Shared.postTortas)

const listener = server.listen(0, function () {
  Shared.log(listener)
})
