#if (typeof require) != "undefined"
exporter = {}
exporter.assert = require("assert")
exporter.ok = exporter.assert.ok
exporter.fail = exporter.assert.fail
exporter.equal = exporter.assert.equal
exporter.notEqual = exporter.assert.notEqual
exporter.deepEqual = exporter.assert.deepEqual
exporter.notDeepEqual = exporter.assert.notDeepEqual
exporter.strictEqual = exporter.assert.strictEqual
exporter.notStrictEqual = exporter.assert.notStrictEqual
exporter.eve = require("../index.js")
console.log "helper called"
exports = module.exports = exporter
#else
#  require = ->
