require("./helper.js");

describe("message", function() {
	var message = eve.message;
	it("should have message", function() {
		ok( message );
	});

	it("should be able to set/get locale", function() {
		message.locale( "en-US" );
		equal( message.locale(), "en-US" );
		message.locale( "zh-CN" );
		ok( message.dictionary["zh-CN"] );
		ok( message.dictionary["zh-CN"]["invalid"] );
	});

	it("should be able to store message", function() {
		message.store("test", { "invalid": "invalid" });
		message.locale("test");
		equal( message("invalid"), "invalid" );
	});

	it("should support default message", function() {
		equal( message("invalid", "default message"), "default message" );
	});

	it("should replace options", function() {
		message.store("test", { "invalid": "invalid {{msg}}" });
		message.locale("test");
		equal( message("invalid", null, {msg: "test"}), "invalid test" );
	});

});


