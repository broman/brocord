import { emitter, logger } from "./util";

emitter.on("GUILD_CREATE", (payload) => {
  logger.debug("Got guild")
})