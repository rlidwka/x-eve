
require("./helper.js");

describe("type", function() {
	var type = eve.type;
	describe("and", function() {

		it("should have and type", function() {
			ok( type.and );
		});

		var schema = type.and([
			type.string().lowercase().notEmpty().len(3,12),
			type.string().trim().notEmpty().email()
		]);

		it("should process values", function() {
			var val = schema.val(" Test@g.com ").val();
			equal(val, "test@g.com");
			ok( !schema.validate() );
		});

		it("should process values for clones", function() {
			var sc = schema.clone();
			var val = sc.val(" Test@g.com ").val();
			equal(val, "test@g.com");
			ok( !sc.validate() );
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

		it("should be able to validate if both fails for clones", function(done) {
			var sc = schema.clone();
			sc.val("");
			var errs = sc.validate(function(errs) {
				ok( errs );
				equal( errs.messages().length, 2 );
				done();
			});
			ok( errs );
		});

		it("should be able to validate if one is valid", function(done) {
			schema.val("test");
			var errs = schema.validate(function(errs) {
				ok( errs );
				equal( errs.messages().length, 1 );
				done();
			});
			ok( errs );
		});

		it("should be able to validate if one is valid for clones", function(done) {
			var sc = schema.clone();
			sc.val("test");
			var errs = sc.validate(function(errs) {
				ok( errs );
				equal( errs.messages().length, 1 );
				done();
			});
			ok( errs );
		});

		it("should be able to validate if both are valid", function(done) {
			schema.val("ddddt@g.com");
			var errs = schema.validate(function(errs) {
				ok( !errs );
				done();
			});
		});

		it("should be able to validate if both are valid for clones", function(done) {
			var sc = schema.clone();
			sc.val("ddddt@g.com");
			var errs = sc.validate(function(errs) {
				ok( !errs );
				done();
			});
		});

		it("should be able to validate async", function(done) {
			var schema = type.and([
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
			var schema = type.and([
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


