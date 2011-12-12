require("./helper.js");

describe("error", function() {
	var error = eve.error;
	it("should have error object", function() {
		ok( error );
	});

	it("should push message", function() {
		var err = new error();
		equal(err.ok, false);

		err.alias( "Name" );

		err.push( "is invalid" );
		err.push( "is not empty" );

		equal( err.ok, true );

		var msgs = err.messages( true );
		ok( msgs );
		equal( msgs.length, 2 );
		equal( msgs[0], "is invalid" );
		msgs = err.messages();
		equal( msgs[0], "Name is invalid" );

		equal( err.message.match(/Name/g).length, 2 );

	});

	it("should push error object", function() {
		var err = new error();
		err.alias("Name");
		err.push( "is invalid" );
		var err1 = new error();
		err1.alias("Password");
		err1.push( "is invalid" );

		var err2 = new error();
		err2.on( "name", err );
		err2.on( "password", err1 );

		var msgs = err2.messages(true);
		ok( msgs );
		equal( msgs.length, 2 );
		equal( msgs[0], "is invalid" );
		msgs = err2.messages();
		equal( msgs[0], "Name is invalid" );

		msgs = err2.on("name").messages();
		equal( msgs.length, 1 );
		equal( msgs[0], "Name is invalid" );

		ok( err2.message.match(/Name/) );
		ok( err2.message.match(/Password/) );

	});

	it("should work with Error", function() {
		var err = new error();
		err.alias( "Name" );
		err.push( "is invalid" );
		err.push( "is not empty" );

		ok( err instanceof Error );
	});

});


