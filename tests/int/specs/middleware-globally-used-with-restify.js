'use strict';

const Restify = require('restify')
const server  = Restify.createServer()

const bodyParser = Restify.plugins.bodyParser

const Shared = require('./lib/shared')

server.use(bodyParser())
server.use(Shared.memrx())

server.get( '/api/tortas', Shared.getTortas )
server.post('/api/tortas', Shared.postTortas)

const listener = server.listen(0, function () {
  Shared.log(listener)
})
