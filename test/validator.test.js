require("./helper.js");

describe("validator", function() {
	describe("version", function() {
		it('should have version', function() {
			ok(eve.version);
		});
	});

	describe("type", function() {
		it("should recognise array", function() {
			ok( eve.validator.isArray([]) );
		});
		it("should recognise function", function() {
			ok( eve.validator.isFunction(function(){}) );
			ok( !eve.validator.isFunction(/d/) );
		});

		it("should recognise object", function() {
			ok( eve.validator.isObject({}) );
			ok( !eve.validator.isObject("") );
			ok( !eve.validator.isObject([]) );
			ok( !eve.validator.isObject(function(){}) );
			ok( !eve.validator.isObject(/d/) );
			ok( !eve.validator.isObject(new Date()) );
		});

		it("should recognise data", function() {
			ok( eve.validator.isDate(new Date()) );
		});
		it("should recognise regexp", function() {
			ok( eve.validator.isRegExp(/d/) );
		});

		it("should recognise boolean", function() {
			ok( eve.validator.isBoolean(false) );
			ok( eve.validator.isBoolean(true) );
		});

		it("should recognise number", function() {
			ok( eve.validator.isNumber(1.2) );
			ok( eve.validator.isInteger(1) );
			ok( !eve.validator.isInteger(1.2) );
		});
	});

	describe("email", function() {
		it("should recognise email", function() {
			ok( eve.validator.isEmail("test@mail.com") );
			ok( eve.validator.isEmail("test.pub@mail.com") );
			ok( eve.validator.isEmail("test-pub@mail.com") );
			ok( !eve.validator.isEmail("test.mail.com") );
		});
	});

	describe("url", function() {
		it("should recognise url", function() {
			ok( eve.validator.isUrl("http:\/\/g.com") );
			ok( eve.validator.isUrl("https:\/\/g.com") );
			ok( eve.validator.isUrl("https:\/\/g.cn") );
			ok( eve.validator.isUrl("g.cn") );
		});
	});

	describe("len", function() {

		it("should check right length of string", function() {
			ok( eve.validator.len("100", 3) );
			ok( !eve.validator.len("100", 2, "4") );
			ok( eve.validator.len("100", 3, 4) );
			ok( !eve.validator.len("100", 4) );
		});

		it("should check right length of array", function() {
			ok( eve.validator.len([1,3,4], 3) );
			ok( eve.validator.len([1,3,4], 3, 4) );
			ok( !eve.validator.len([1,3,4], 4) );
		});
	});

});
