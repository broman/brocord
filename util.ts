// Event Emitter
import EventEmitter = require("events");
export const emitter = new EventEmitter();

// Logging
const winston = require('winston');
export const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({filename: 'log.log', level: 'debug'})
  ]
});
if(process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Opcodes
export enum Opcodes {
  DISPATCH,
  HEARTBEAT,
  IDENTIFY,
  PRESENCE_UPDATE,
  VOICE_STATE_UPDATE,
  RESUME = 6,
  RECONNECT,
  REQUEST_GUILD_MEMBERS,
  INVALID_SESSION,
  HELLO,
  ACK
}