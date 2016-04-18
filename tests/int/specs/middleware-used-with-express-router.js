'use strict';

const Express     = require('express')
const server      = Express()
const tortaRouter = new Express.Router()

const bodyParser  = require('body-parser')

const Shared      = require('./lib/shared')

server.use(bodyParser.urlencoded({extended: true}))
server.use(bodyParser.json({strict: false}))

tortaRouter.route('/api/tortas')
  .get(Shared.getTortas)
  .post(Shared.postTortas)

server.use('/', Shared.memrx(), tortaRouter)

const listener = server.listen(0, function () {
  Shared.log(listener)
})
