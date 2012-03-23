require("./helper.js");

describe("message", function() {
	var message = eve.message;
	it("should have message", function() {
		ok( message );
	});

	it("should be able to set/get locale", function() {
		message.message.locale( "en-US" );
		equal( message.message.locale(), "en-US" );
		message.message.locale( "zh-CN" );
		ok( message.message.dictionary["zh-CN"] );
		ok( message.message.dictionary["zh-CN"]["invalid"] );
	});

	it("should be able to store message", function() {
		message.message.store("test", { "invalid": "invalid" });
		message.message.locale("test");
		equal( message("invalid"), "invalid" );
	});

	it("should support default message", function() {
		equal( message("invalid", "default message"), "default message" );
	});

	it("should replace options", function() {
		message.message.store("test", { "invalid": "invalid {{msg}}" });
		message.message.locale("test");
		equal( message("invalid", null, {msg: "test"}), "invalid test" );
	});

});


