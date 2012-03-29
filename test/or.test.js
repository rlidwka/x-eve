
require("./helper.js");

describe("type", function() {
	var type = eve.type;
	describe("or", function() {

		it("should have or type", function() {
			ok( type.or );
		});

		var schema = type.or([
			type.string().lowercase().notEmpty().len(3,12),
			type.string().trim().notEmpty().email()
		]);

		it("should process value a", function() {
			var val = schema.val("Test").val();
			equal(val, "test");
			ok( !schema.validate() );
		});

		it("should process value b", function() {
			var val = schema.val("Ddddddddddddddddddddddddt@g.com ").val();
			equal(val, "Ddddddddddddddddddddddddt@g.com");
			ok( !schema.validate() );
		});


		it("should be able to validate if both fails", function(done) {
			schema.val("");
			var errs = schema.validate(function(errs) {
				ok( errs );
				equal( errs.messages().length, 2 );
				done();
			});
			ok( errs );
		});

		it("should be able to validate if one is valid", function(done) {
			schema.val("test");
			var errs = schema.validate(function(errs) {
				ok( !errs );
				done();
			});
		});

		it("should be able to validate if both are valid", function(done) {
			schema.val("ddddt@g.com");
			var errs = schema.validate(function(errs) {
				ok( !errs );
				done();
			});
		});

		it("should validate objects", function() {
			var schema = type.or([
					type.object({
						login: type.string().trim().lowercase().notEmpty().len(3,12)
						, email: type.string().trim().notEmpty().email()
					})
			]);

			var val = schema.val({login: " Test ", email: "t@g.com"}).val();
			equal(val.login, "test");
			ok( !schema.validate() );
		});

		it("should validate invalid objects", function(done) {
			var schema = type.or([
					type.object({
						login: type.string().trim().lowercase().notEmpty().len(3,12)
						, email: type.string().trim().notEmpty().email()
					})
			]);
			schema.val({login: "t", email: "g.com"});
			var errs = schema.validate(function(errs) {
				ok( errs );
				equal( errs.messages().length, 2 );
				done();
			});
			ok( errs );
		});


		it("should be able to validate async", function(done) {
			var schema = type.or([
				type.string().validator(function(val, next) {
					setTimeout(function() {
						next( val != "admin" );
					}, 100);
				}, "must not be admin")
				, type.string().trim().email().validator(function(val, next) {
					setTimeout(function() {
						next( val.length != 5 );
					}, 100);
				}, "must not have 5 chars")
			]);
			schema.val("admin").validate(function(errs) {
				ok( errs );
				equal( errs.messages().length, 3 );
				done();
			});
		});

		it("should support custom validators", function() {
			var schema = type.or([
				type.string().validator(function(val) {
					ok( this );
					equal( val, "admin" );
					return true;
				})
			]);
			schema.val("admin").validate();
		});

/*
		it("should output with alias", function() {
			schema = type.or([
				type.string().alias("Login").trim().lowercase().notEmpty().len(3,12)
				, type.string().alias("Email").trim().notEmpty().email()
			]);

			schema.val("t").validate(function(err) {
				ok( err );
				var msgs = err.messages();
				ok( !msgs[0].indexOf("Login") );
				ok( !msgs[1].indexOf("Email") );
			});
		});		
*/
	});
});


