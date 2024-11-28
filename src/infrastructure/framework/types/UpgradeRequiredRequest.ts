import { Request } from 'express'
import { Duplex } from 'stream'

export type UpgradeRequiredRequest = {
  request: Request
  socket: Duplex
  head: Buffer
}
