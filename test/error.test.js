require("./helper.js");

describe("error", function() {
	var error = eve.error;
	it("should have error object", function() {
		ok( error );
	});

	it("should push message without key", function() {
		var err = new error();
		equal(err.length, 0);
		err.push( null, "is invalid", "Name" );
		equal(err.length, 1);
		var msgs = err.messages();
		ok( msgs );
		equal( msgs.length, 1 );
		equal( msgs[0], "is invalid" );
		msgs = err.messages(true);
		equal( msgs[0], "Name is invalid" );
	});

	it("should push message with key", function() {
		var err = new error();
		err.push( "name", "is invalid" );
		err.push( "password", "is invalid", "Password" );
		var msgs = err.messages(true);
		ok( msgs );
		equal( msgs.length, 2 );
		equal( msgs[0], "name is invalid" );
		equal( msgs[1], "Password is invalid" );
	});

	it("should push error object", function() {
		var err = new error();
		err.push( null, "is invalid", "Name" );
		var err1 = new error();
		err1.push( null, "is invalid", "Password" );

		var err2 = new error();
		err2.push( "name", err );
		err2.push( "password", err1 );

		var msgs = err2.messages();
		ok( msgs );
		equal( msgs.length, 2 );
		equal( msgs[0], "is invalid" );
		msgs = err2.messages(true);
		equal( msgs[0], "Name is invalid" );
		msgs = err2.on("name", true);
		equal( msgs.length, 1 );
		equal( msgs[0], "Name is invalid" );
	});
});


