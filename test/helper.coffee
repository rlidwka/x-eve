#if (typeof require) != "undefined"
exporter = {}
exporter.assert = require("chai").assert
exporter.ok = exporter.assert.ok
exporter.fail = exporter.assert.fail
exporter.equal = exporter.assert.equal
exporter.notEqual = exporter.assert.notEqual
exporter.deepEqual = exporter.assert.deepEqual
exporter.notDeepEqual = exporter.assert.notDeepEqual
exporter.strictEqual = exporter.assert.strictEqual
exporter.notStrictEqual = exporter.assert.notStrictEqual
exporter.eve = require("../index.js")
exports = module.exports = exporter
#else
#  require = ->
