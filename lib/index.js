require('babel-register')
require('babel-polyfill')

exports.generateInvertedIndex = require('./generateInvertedIndex').default
exports.produceTopk = require('./produceTopk').default
