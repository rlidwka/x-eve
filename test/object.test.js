
require("./helper.js");

describe("type", function() {
	var type = eve.type;
	describe("object", function() {

		it("should have object type", function() {
			ok( type.object );
		});

		var schema = type.object({
			login: type.string().trim().lowercase().notEmpty().len(3,12)
			, email: type.string().trim().notEmpty().email()
		});

		it("should process value", function() {
			var val = schema.val({login: " Test ", email: "t@g.com"}).val();
			equal(val.login, "test");
			ok( !schema.validate() );
		});

		it("should be able to validate", function(done) {
			schema.val({login: "t", email: "g.com"});
			var errs = schema.validate(function(errs) {
				ok( errs );
				equal( errs.length, 2 );
				done();
			});
			ok( errs );
		});

		it("should be able to validate async", function(done) {
			var schema = type.object({
				login: type.string().validator(function(val, next) {
					setTimeout(function() {
						next( val != "admin" );
					}, 100);
				}, "must be unique")
				, email: type.string().trim().email().validator(function(val, next) {
					setTimeout(function() {
						next( val != "t@g.com" );
					}, 100);
				}, "must be unique")
			});
			schema.val({login: "admin", email: "t@g.com"}).validate(function(errs) {
				ok( errs );
				equal( errs.length, 2 );
				done();
			});
		});

		it("should be able to ignore undefined attribute", function() {
			schema.val({login: "test"});
			var errs = schema.validate();
			ok( errs );
			equal( errs.length, 1 );
			errs = schema.validate(true);
			ok ( !errs );
		});

		it("should support context in coustom validator", function() {
			var schema = type.object({ 
				login: type.string().validator(function(val) {
					ok( this.login );
					equal( this.login, "admin" );
					return true;
				})
			});
			schema.val({login: "admin"}).validate();
		});
	});
});


