require("./helper.js");

var type = jschema.type;

describe("type", function() {
	describe("any", function() {
		it("shoud have any type", function() {
			ok( type.any );
		});

		it("shoud can check exist and empty", function() {
			ok( type.any().required().value(null).validate() );
			ok( !type.any().required().value("").validate() );

			ok( type.any().notEmpty().value(null).validate() );
			ok( type.any().notEmpty().value("").validate() );
		});

		it("shoud return in callback", function(done) {
			type.any().required().value(null).validate(function(err) {
				ok( err );
				done();
			});
		});
		it("shoud can add sync validator", function(done) {
			var schema = type.any().notEmpty().validator(function(val) {
				return val == 10;
			}, "equal 10");
			ok( schema.value(9).validate() );
			ok( !schema.value(10).validate() );
			schema.value(10).validate(function(err) {
				ok(!err);
				done();	
			});
		});
		it("shoud can add async validator", function(done) {
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

		it("shoud set default value", function() {
			equal(type.any().default("ok").value(null).value(), "ok");
			equal(type.any().default("ok").value(undefined).value(), "ok");
		});

		it("shoud can add a processor", function() {
			var schema = type.any().processor(function(val) {
				return val * 2;
			});
			equal(schema.value(10).value(), 20);
		});

	});
});
