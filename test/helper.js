if ( typeof require !== "undefined" ) {
	var assert = require("assert");
	ok = assert.ok;
	fail = assert.fail;
	equal = assert.equal;
	notEqual = assert.notEqual;
	deepEqual = assert.deepEqual;
	notDeepEqual = assert.notDeepEqual;
	strictEqual = assert.strictEqual;
	notStrictEqual = assert.notStrictEqual;
	eve = require("../index.js");
} else {
	//browser
	var  require = function() {
	}
}