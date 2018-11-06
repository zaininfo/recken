import fs from 'fs'
import path from 'path'
import config from 'config'
import JSONStream from 'JSONStream'
import es from 'event-stream'
import invariant from 'invariant'
import jsonfile from 'jsonfile'
import progress from 'stream-progressbar'
import { each } from 'lodash'
import { fileExists } from './fileHelper'

const INVERTED_INDEX_FILENAME = config.invertedIndex.filename
invariant(INVERTED_INDEX_FILENAME, 'Inverted index filename is required.')
const INVERTED_INDEX_FILEPATH = path.resolve(__dirname, '..', INVERTED_INDEX_FILENAME)

export default function ({ 'source-file': sourceFilename }) {
  invariant(sourceFilename, 'Source file is required.')

  const { size } = fileExists(sourceFilename)
  const invertedIndex = {}

  // generate inverted index:
  // 1. read source file as a stream
  // 2. parse the stream to extract individual item
  // 3. push item to a nested map of { attributes -> attribute-values -> items }
  const stream = fs.createReadStream(sourceFilename)
    .pipe(progress(':bar', { total: size }))
    .pipe(JSONStream.parse('$*'))
    .pipe(es.mapSync(item => {
      each(item.value, (attributeValue, attributeName) => {
        invertedIndex[attributeName] = invertedIndex[attributeName] || {}
        invertedIndex[attributeName][attributeValue] = invertedIndex[attributeName][attributeValue] || []
        invertedIndex[attributeName][attributeValue].push(item.key)
      })
    }))

  // write inverted index to a file, after stream is processed
  stream.on('end', () => {
    try {
      jsonfile.writeFileSync(INVERTED_INDEX_FILEPATH, invertedIndex)
    } catch (e) {
      throw new Error('Inverted index could not be saved.', e)
    }
  })
}
