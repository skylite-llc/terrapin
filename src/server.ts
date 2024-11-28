import 'reflect-metadata'
import '@config'
import application from './app'
import Log from '@logger/Log'
import * as http from 'http'
import process from 'process'
import { Container } from 'typedi'

const PORT = process.env.APP_PORT || 8080
const HOST = process.env.APP_HOST || 'localhost'

const server = http.createServer(application.instance)

Container.set('httpServer', server)

server.listen(PORT, () => {
  Log.success(
    `${process.env.APP_NAME ?? 'Unnamed Application'} running: ${HOST}:${PORT}`,
  )

  if (process.env.APP_ENV !== 'local')
    process.on('message', message => {
      if (message === 'shutdown') {
      }
    })
})
