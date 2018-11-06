import path from 'path'
import config from 'config'
import { StreamSummary } from 'datalib-sketch'
import invariant from 'invariant'
import jsonfile from 'jsonfile'
import { each, filter, range, reverse, sortBy, zip, zipObject } from 'lodash'
import { fileExists } from './fileHelper'

const INVERTED_INDEX_FILENAME = config.invertedIndex.filename
invariant(INVERTED_INDEX_FILENAME, 'Inverted index filename is required.')
const INVERTED_INDEX_FILEPATH = path.resolve(__dirname, '..', INVERTED_INDEX_FILENAME)
const STREAM_SUMMARY_BUCKETS = config.streamSummary.buckets

export default function ({ 'sku-code': skuCode, 'source-file': sourceFilename, 'number-of-items': k }) {
  invariant(skuCode, 'SKU code is required.')
  invariant(sourceFilename, 'Source file is required.')
  k = Number(k)
  invariant(k >= 10 && k <= 100, 'Number of items should be between 10 & 100 (inclusive).')

  fileExists(sourceFilename)
  fileExists(INVERTED_INDEX_FILEPATH)

  // load source and inverted index files to memory
  const items = jsonfile.readFileSync(sourceFilename)
  const invertedIndex = jsonfile.readFileSync(INVERTED_INDEX_FILEPATH)

  // get details of given item
  const item = items[skuCode]
  invariant(item, 'A valid SKU code is required.')

  // resolve attributes and their weights, create a stream summary data structure
  const attributes = reverse(sortBy(Object.keys(item)))
  const attributeWeights = zipObject(attributes, range(1, attributes.length + 1))
  const streamSummary = new StreamSummary(STREAM_SUMMARY_BUCKETS)

  // generate similar items:
  // 1. process attributes in increasing order of weight
  //    (ensures that similar items of higher weighted attributes
  //     are not overwritten by similar items of lower weighted attributes)
  // 2. get all similar items on the basis of the attribute value
  // 3. add similar items and the attribute weight to stream summary
  each(attributes, attribute => {
    const similarItems = invertedIndex[attribute][item[attribute]]
    const attributeWeight = attributeWeights[attribute]
    each(similarItems, similarItem => streamSummary.add(similarItem, attributeWeight))
  })

  // given item is one of the most similar items of itself, so, produce one extra similar item
  const topk = zip(streamSummary.values(k + 1), streamSummary.counts(k + 1))

  // remove given item, if present
  const filteredTopk = filter(topk, topx => topx[0] !== skuCode)
  const topkLength = filteredTopk.length
  if (topkLength !== k) {
    filteredTopk.splice(topkLength - 1)
  }

  return filteredTopk
}
