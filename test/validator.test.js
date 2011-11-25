if ( typeof require !== "undefined" ) {
	require("./qunit/helper.js");
	var jschema = require("../index.js");
	module = QUnit.module;
}

module("validator");

test("version", function() {
	ok(jschema.version);
});

test("type", function() {
	ok( jschema.validator.isArray([]), "[] is array" );
	ok( jschema.validator.isFunction(function(){}), "check function" );
	ok( !jschema.validator.isFunction(/d/), "regexp is not function" );

	ok( jschema.validator.isObject({}), "check object" );
	ok( !jschema.validator.isObject(""), "string is not object" );
	ok( !jschema.validator.isObject([]), "array is not object" );
	ok( !jschema.validator.isObject(function(){}), "function is not object" );
	ok( !jschema.validator.isObject(/d/), "regexp is not object" );
	ok( !jschema.validator.isObject(new Date()), "date is not object" );

	ok( jschema.validator.isDate(new Date()), "check date" );
	ok( jschema.validator.isRegExp(/d/), "check RegExp" );

	ok( jschema.validator.isBoolean(false), "check boolean" );
	ok( jschema.validator.isBoolean(true), "check boolean" );

	ok( jschema.validator.isNumber(1.2), "check number" );
	ok( jschema.validator.isInteger(1), "check integer" );
	ok( !jschema.validator.isInteger(1.2), "Integer not float" );
});

test("email", function() {
	ok( jschema.validator.isEmail("test@mail.com"), "regluar email" );
	ok( jschema.validator.isEmail("test.pub@mail.com"), "email name with dot" );
	ok( jschema.validator.isEmail("test-pub@mail.com"), "email name with -" );
	ok( !jschema.validator.isEmail("test.mail.com"), "not email" );
});



test("url", function() {
	ok( jschema.validator.isUrl("http://g.com"), "regluar url" );
	ok( jschema.validator.isUrl("https://g.com"), "https url" );
	ok( jschema.validator.isUrl("https://g.cn"), "suffix cn" );
	ok( jschema.validator.isUrl("g.cn"), "not a url" );
});

test("len", function() {

	ok( jschema.validator.len("100", 3), "string length of 3" );
	ok( !jschema.validator.len("100", 2, "4"), "ignore argument not number" );
	ok( jschema.validator.len("100", 3, 4), "string len in [ min  max ]" );
	ok( !jschema.validator.len("100", 4), "string not length of 4" );

	ok( jschema.validator.len([1,3,4], 3), "array length of 3" );
	ok( jschema.validator.len([1,3,4], 3, 4), "array len in [ min  max ]" );
	ok( !jschema.validator.len([1,3,4], 4), "array not length of 4" );

});

