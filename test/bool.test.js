
require("./helper.js");

describe("type", function() {
	var type = eve.type;
	describe("bool", function() {

		it("should have bool type", function() {
			ok( type.bool );
		});

		it("should convert type", function() {
			strictEqual( type.bool().val(" true ").val(), true );
			strictEqual( type.bool().val(" Tr_ue").val(), " Tr_ue" );
			strictEqual( type.bool().val("fAlse ").val(), false );
		});

		it("should validate", function() {
			ok( type.bool().val("test").validate() );
			ok( !type.bool().val(true).validate() );
			ok( !type.bool().val(false).validate() );
			ok( !type.bool().val('false').validate() );
			ok( !type.bool().val('true').validate() );
		});

		it("should pass not required bools", function() {
			ok( !type.bool().val(undefined).validate() );
			ok( !type.bool().val(null).validate() );
		});

		it("should raise on required bools", function() {
			ok( type.bool().required().val(undefined).validate() );
			ok( type.bool().required().val(null).validate() );
		});

	});
});

