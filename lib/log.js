import path from 'path'
import config from 'config'
import winston from 'winston'

const transports = []

if (config.log.file) {
  const { filename, ...options } = config.log.file
  transports.push(new winston.transports.File({
    ...options,
    filename: path.resolve(__dirname, '..', filename)
  }))
}

export default new winston.Logger({
  transports: transports,
  handleExceptions: true,
  humanReadableUnhandledException: true
})

// adapted from: https://github.com/winstonjs/winston/issues/228#issuecomment-147077154
export function flushToFile (logger) {
  return new Promise(resolve => logger.transports.file.on('flush', resolve))
}
