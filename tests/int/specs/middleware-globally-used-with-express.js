'use strict';

const Express = require('express')
const server  = Express()

const bodyParser = require('body-parser')

const Shared = require('./lib/shared')

server.use(bodyParser.urlencoded({extended: true}))
server.use(bodyParser.json({strict: false}))

server.use(Shared.memrx())

server.get( '/api/tortas', Shared.getTortas )
server.post('/api/tortas', Shared.postTortas)

const listener = server.listen(0, function () {
  Shared.log(listener)
})
