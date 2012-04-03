require("./helper.js");

describe("type", function() {
	var type = eve.type;
	describe("array", function() {

		it("should have array type", function() {
			ok( type.array );
		});

		it("should be able to convert type", function() {
			deepEqual( type.array().val([1, 2, 3]).val(), [1, 2, 3] );
		});

		it("should be able to validate length", function() {
			var err = type.array().len(5).val([1, 2, 3]).validate();
			ok( err );
			equal( err.messages().length, 1 );
			var err = type.array().len(4, 5).val([1, 2, 3]).validate();
			ok( err );
			equal( err.messages().length, 1 );
		});

		it("should have item schema", function() {
			var schema = type.array( type.number().max(2) ).len(5).val([1, "2", 3]);
			deepEqual( schema.val(), [1, 2, 3] );
			var errs = schema.validate( function(errs) {
				equal( errs.messages().length, 2 );
			} );
			equal( errs.messages().length, 2 );
		});

		it("should validate required if required and embedded in object", function() {
			var schema = type.object( { test: type.array( type.number().required() ).required() } ).required();

			var errs = schema.val( { test2: ["a"] }).validate( function(errs) {
				ok( errs );
				equal( errs.messages().length, 1 );
			} );
			ok( errs );
			equal( errs.messages().length, 1 );
		});

		it("should raise if empty", function() {
			var schema = type.object( { test: type.array( type.number().required() ).notEmpty() } ).required();

			var errs = schema.val( { test: [] }).validate( function(errs) {
				ok( errs );
				equal( errs.messages().length, 1 );
			} );
			ok( errs );
			equal( errs.messages().length, 1 );
		});

		it("should validate inner object", function() {
			var schema = type.array( type.object({ login: type.string().required() })).val([{"nologin": true}, {"login": true}, {"nologin": true}]);
			var errs = schema.validate( function(errs) {
				equal( errs.messages().length, 3 );
			} );
			equal( errs.messages().length, 3 );
		});

		it("should have item schema of clone", function() {
			var schema = type.array( type.number().max(2) ).len(5).clone().val([1, "2", 3]);
			deepEqual( schema.val(), [1, 2, 3] );
			var errs = schema.validate( function(errs) {
				equal( errs.messages().length, 2 );
			} );
			equal( errs.messages().length, 2 );
		});

		it("should be able to recognize type alias", function() {
			var data = type.array( { login: String } ).val( [{login: "123"}] ).val();
			strictEqual( data[0].login, "123" );
		});
	});

});


