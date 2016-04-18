'use strict';

const Express = require('express')
const server  = Express()

const bodyParser = require('body-parser')

const Shared = require('./lib/shared')

server.use(bodyParser.urlencoded({extended: true}))
server.use(bodyParser.json({strict: false}))

server.get('/api/tortas', Shared.memrx(), Shared.getTortas)
server.post('/api/tortas', Shared.memrx(), Shared.postTortas)

const listener = server.listen(0, function () {
  Shared.log(listener)
})
