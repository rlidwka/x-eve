require("./helper.js");

var type = eve.type;

describe("type", function() {
	describe("any", function() {

		it("should have any type", function() {
			ok( type.any );
		});

		it("should can check exist and empty", function() {
			ok( type.any().required().value(null).validate() );
			ok( !type.any().required().value("").validate() );

			ok( type.any().notEmpty().value(null).validate() );
			ok( type.any().notEmpty().value("  ").validate() );
		});

		it("should return in callback", function(done) {
			type.any().required().value(null).validate(function(err) {
				ok( err );
				done();
			});
		});

		it("should skip validator when empty", function(done) {
			type.any().validator(function(val) {
				return val === 10;
			}).value(null).validate(function(err) {
				ok(!err);
				done();
			});
		});

		it("should can add sync validator", function(done) {
			var schema = type.any().validator(function(val) {
				return val == 10;
			}, "equal 10");
			ok( schema.value(9).validate() );
			ok( !schema.value(10).validate() );
			schema.value(10).validate(function(err) {
				ok(!err);
				done();	
			});
		});

		it("should can add async validator", function(done) {
			var schema = type.any().notEmpty().validator(function(val, done) {
				setTimeout(function() {
					done( val == 10 );
				}, 100);
			}, "equal 10");
			schema.value(10).validate(function(err) {
				ok(!err);
				done();	
			});
		});		

		it("should set default value", function() {
			equal(type.any().default("ok").value(null).value(), "ok");
			equal(type.any().default("ok").value(undefined).value(), "ok");
		});

		it("should can add a processor", function() {
			var schema = type.any().processor(function(val) {
				return val * 2;
			});
			equal(schema.value(10).value(), 20);
		});

		it("should output mssage with alias", function() {
			var schema = type.any().alias("Name").notEmpty().validator(function(val) {
				return false;
			}, "is invalid");
			var err = schema.val("test").validate();
			ok( err );
			equal(err.messages()[0], "Name is invalid");
		});

	});
});

