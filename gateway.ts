const WebSocketClient = require('websocket').client
const os = require('os')

import {logger, Opcodes, emitter } from "./util"

interface Connection {
  connected: any

  sendUTF(data: string): void

  on(event: string, param2: (error: any) => void): void
}

interface Error {
  error: any
}

class Gateway {
  #client: typeof WebSocketClient
  #con?: Connection
  #seq?: number

  constructor() {
    this.#client = new WebSocketClient()
    this.start()
  }
  start() {
    this.#client.on('connectFailed', (error: Error) => {
      logger.error('Connect Error: ' + error.toString())
    })

    // Main loop, handles data receiving, errors, and disconnects.
    this.#client.on('connect', (connection: Connection) => {
      this.#con = connection
      logger.info('WebSocket Client Connected')
      this.#con.on('error', function (error) {
        logger.error("Connection Error: " + error.toString())
      })
      this.#con.on('close', function (event) {
        logger.info(`Connection closed with code ${event}`)
      })
      this.#con.on('message', (message) => {
        if (message.type === 'utf8') {
          const payload = JSON.parse(message.utf8Data)
          logger.info(message.utf8Data)
          this.#seq = payload.s
          switch(payload.op) {
            case Opcodes.DISPATCH:
              // Any and all Discord events are sent here.
              logger.debug("Received DISPATCH")
              emitter.emit(payload.t, payload)
              break
            case Opcodes.HEARTBEAT:
              // Time to send the heartbeat
            case Opcodes.HELLO:
              // On HELLO, send ident and register heartbeat interval
              logger.info(`Received HELLO`)
              logger.debug(`Heartbeat interval ${payload.d.heartbeat_interval}`)
              setInterval(() => this.heartbeat(), payload.d.heartbeat_interval)
              this.ident()
              break
            case Opcodes.ACK:
              logger.debug(`Got ack`)
          }
        }
      })
    })
    this.#client.connect('wss://gateway.discord.gg/?v=9&encoding=json')
  }
  sendJSON(payload?: Object) {
    logger.info(`Sending ${JSON.stringify(payload)}`)
    this.#con?.sendUTF(JSON.stringify(payload))
  }
  send(payload: string) {
    this.#con?.sendUTF(payload)
  }

  heartbeat() {
    this.sendJSON({
      "op": Opcodes.HEARTBEAT,
      "d": this.#seq ?? null
    })
  }

  ident() {
    const load = {
      "op": Opcodes.IDENTIFY,
      "d": {
        "token": process.env.token,
        "intents": 513,
        "properties": {
          "$os": os.platform(),
          "$browser": "brocord",
          "$device": "brocord"
        }
      }
    }
    this.sendJSON(load)
  }

}

const gateway = new Gateway()



