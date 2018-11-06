import config from 'config'
import commandLineCommands from 'command-line-commands'
import commandLineTool from 'command-line-tool'
import commandLineUsage from 'command-line-usage'
import { find, fromPairs, map } from 'lodash'
import { default as log, flushToFile } from '../lib/log'
import generateInvertedIndex from '../lib/generateInvertedIndex'
import produceTopk from '../lib/produceTopk'

// parse command line parameters
const commands = config.cli.commands
const usage = commandLineUsage(config.cli.usage)
const commandNames = map(commands, command => command.name)
let commandName, argv, options
try {
  ({ command: commandName, argv } = commandLineCommands(commandNames))
  const command = find(commands, command => command.name === commandName)
  if (command) {
    ({ options } = commandLineTool.getCli(command.options, [], { argv }))
  }
} catch (e) {
  halt('Error while parsing command line.', e, usage)
}

// perform required action
try {
  switch (commandName) {
    case 'help':
      commandLineTool.printOutput(usage)
      break
    case 'index':
      generateInvertedIndex(options)
      break
    case 'topk':
      const topk = produceTopk(options)
      const prettifiedTopk = JSON.stringify(fromPairs(topk), null, 2)
      commandLineTool.printOutput(prettifiedTopk)
      break
  }
} catch (e) {
  halt(e.message, e)
}

async function halt (reason, error, output) {
  log.error(reason, error)
  await flushToFile(log)
  commandLineTool.halt(output || reason)
}
