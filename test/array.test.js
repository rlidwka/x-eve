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
			var schema = type.array( type.number().max(2) ).len(5).val([1, "2s", 3]);
			deepEqual( schema.val(), [1, 2, 3] );
			var errs = schema.validate( function(errs) {
				equal( errs.messages().length, 2 );
			} );
			equal( errs.messages().length, 2 );
		});

		it("should be able to recognize type alias", function() {
			var data = type.array( { login: String } ).val( [{login: 123}] ).val();
			strictEqual( data[0].login, "123" );
		});
	});

});


