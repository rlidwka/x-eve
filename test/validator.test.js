require("./helper.js");

describe("validator", function() {
	describe("version", function() {
		it('should have version', function() {
			ok(jschema.version);
		});
	});

	describe("type", function() {
		it("should recognise array", function() {
			ok( jschema.validator.isArray([]) );
		});
		it("should recognise function", function() {
			ok( jschema.validator.isFunction(function(){}) );
			ok( !jschema.validator.isFunction(/d/) );
		});

		it("should recognise object", function() {
			ok( jschema.validator.isObject({}) );
			ok( !jschema.validator.isObject("") );
			ok( !jschema.validator.isObject([]) );
			ok( !jschema.validator.isObject(function(){}) );
			ok( !jschema.validator.isObject(/d/) );
			ok( !jschema.validator.isObject(new Date()) );
		});

		it("should recognise data", function() {
			ok( jschema.validator.isDate(new Date()) );
		});
		it("should recognise regexp", function() {
			ok( jschema.validator.isRegExp(/d/) );
		});

		it("should recognise boolean", function() {
			ok( jschema.validator.isBoolean(false) );
			ok( jschema.validator.isBoolean(true) );
		});

		it("should recognise number", function() {
			ok( jschema.validator.isNumber(1.2) );
			ok( jschema.validator.isInteger(1) );
			ok( !jschema.validator.isInteger(1.2) );
		});
	});

	describe("email", function() {
		it("should recognise email", function() {
			ok( jschema.validator.isEmail("test@mail.com") );
			ok( jschema.validator.isEmail("test.pub@mail.com") );
			ok( jschema.validator.isEmail("test-pub@mail.com") );
			ok( !jschema.validator.isEmail("test.mail.com") );
		});
	});

	describe("url", function() {
		it("should recognise url", function() {
			ok( jschema.validator.isUrl("http:\/\/g.com") );
			ok( jschema.validator.isUrl("https:\/\/g.com") );
			ok( jschema.validator.isUrl("https:\/\/g.cn") );
			ok( jschema.validator.isUrl("g.cn") );
		});
	});

	describe("len", function() {

		it("should check right length of string", function() {
			ok( jschema.validator.len("100", 3) );
			ok( !jschema.validator.len("100", 2, "4") );
			ok( jschema.validator.len("100", 3, 4) );
			ok( !jschema.validator.len("100", 4) );
		});

		it("should check right length of array", function() {
			ok( jschema.validator.len([1,3,4], 3) );
			ok( jschema.validator.len([1,3,4], 3, 4) );
			ok( !jschema.validator.len([1,3,4], 4) );
		});
	});

});
