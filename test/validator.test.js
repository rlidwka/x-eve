if ( typeof require !== "undefined" ) {
	require("./qunit/helper.js");
	var jschema = require("../index.js");
	module = QUnit.module;
}

module("validator");

test("version", function() {
	assert.ok(jschema.version);
});
