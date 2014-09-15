if (typeof require !== 'undefined') {
  // node.js environment
  var global = function(){ return this }();
  var assert = require('assert')
  global.ok = assert.ok
  global.fail = assert.fail
  global.equal = assert.equal
  global.notEqual = assert.notEqual
  global.deepEqual = assert.deepEqual
  global.notDeepEqual = assert.notDeepEqual
  global.strictEqual = assert.strictEqual
  global.notStrictEqual = assert.notStrictEqual
  global.eve = require('../')
} else {
  // browser
  var require = function() {}
}

// old coffee stuff
if (typeof window !== 'undefined')
  exporter = window.chai.assert
else
  exporter = require("chai").assert

exporter.eve = require('../lib/eve.js')
exports = module.exports = exporter
