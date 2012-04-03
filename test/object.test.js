
require("./helper.js");

describe("type", function() {
	var type = eve.type;
	describe("object", function() {

		it("should have object type", function() {
			ok( type.object );
		});

		var schema = type.object({
			login: type.string().trim().lowercase().notEmpty().len(3,12)
			, email: type.string().trim().notEmpty().email()
		});

		it("should process value", function() {
			var val = schema.val({login: " Test ", email: "t@g.com"}).val();
			equal(val.login, "test");
			ok( !schema.validate() );
		});

		it("should process value of clone", function() {
			var sc = schema.clone();
			var val = sc.val({login: " Test ", email: "t@g.com"}).val();
			equal(val.login, "test");
			ok( !sc.validate() );
		});

		it("should be able to validate", function(done) {
			schema.val({login: "t", email: "g.com"});
			var errs = schema.validate(function(errs) {
				ok( errs );
				equal( errs.messages().length, 2 );
				done();
			});
			ok( errs );
		});

		it("should be able to validate clone", function(done) {
			var sc = schema.clone();
			sc.val({login: "t", email: "g.com"});
			var errs = sc.validate(function(errs) {
				ok( errs );
				equal( errs.messages().length, 2 );
				done();
			});
			ok( errs );
		});


		it("should be able to validate async", function(done) {
			var schema = type.object({
				login: type.string().validator(function(val, next) {
					setTimeout(function() {
						next( val != "admin" );
					}, 100);
				}, "must be unique")
				, email: type.string().trim().email().validator(function(val, next) {
					setTimeout(function() {
						next( val != "t@g.com" );
					}, 100);
				}, "must be unique")
			});
			schema.val({login: "admin", email: "t@g.com"}).validate(function(errs) {
				ok( errs );
				equal( errs.messages().length, 2 );
				done();
			});
		});

		it("should allow a not required inner object that is not empty when it exists", function(done) {
			var schema = type.object({
				login: type.object( { inner: type.string() } ).notEmpty()
			});
			var errs = schema.val({ other: {} }).validate();
			ok( !errs );
			var errs = schema.val({ login: {} }).validate();
			ok( errs );
			done();
		});

		it("should validate an object within an invalid object", function(done) {
			var schema = type.object({
				test: type.object({
					login: type.string().trim().lowercase().notEmpty().len(3,12)
					, email: type.string().trim().notEmpty().email()
				})
			});
			schema.val( { test: {login: "admin", email: "tg.com"} } ).validate(function(errs) {
				ok( errs );
				equal( errs.messages().length, 1 );
				done();
			});
		});

		it("should validate an object within a valid object", function(done) {
			var schema = type.object({
				test: type.object({
					login: type.string().trim().lowercase().notEmpty().len(3,12)
					, email: type.string().trim().notEmpty().email()
				})
			});
			schema.val( { test: {login: "admin", email: "t@g.com"} } ).validate(function(errs) {
				ok( !errs );
				done();
			});
		});


		it("should be able to ignore undefined attribute", function() {
			//schema.val({login: "test"});
			//var errs = schema.validate();
			//ok( errs );
			//equal( errs.messages().length, 1 );
			//errs = schema.validate(true);
			//ok ( !errs );
		});

		it("should be able to validate required attribute", function(done) {
			var schema = type.object({
				login: type.string().required()
			});
			schema.val({nologin: "t"});
			var errs = schema.validate(function(errs) {
				ok( errs );
				equal( errs.messages().length, 1 );
				done();
			});
			ok( errs );
		});

		it("should be able be required itself", function() {
			var schema = type.object({
				login: type.object( { user: type.string().required() } ).required()
			});
			schema.val({nologin: "t"});
			var errs = schema.validate(function(errs) {
				ok( errs );
				equal( errs.messages().length, 2 );
			});
			ok( errs );
			schema.val({login: { user: "test" }});			
			errs = schema.validate();
			ok( !errs );
		});

		it("should support context in coustom validator", function() {
			var schema = type.object({ 
				login: type.string().validator(function(val) {
					ok( this.login );
					equal( this.login, "admin" );
					return true;
				})
			});
			schema.val({login: "admin"}).validate();
		});

		it("should output with alias", function() {
			schema = type.object({
				login: type.string().alias("Login").trim().lowercase().notEmpty().len(3,12)
				, email: type.string().alias("Email").trim().notEmpty().email()
			});

			schema.val({ login: "t", email: "e"}).validate(function(err) {
				ok( err );
				var msgs = err.messages();
				ok( !msgs[0].indexOf("Login") );
				ok( !msgs[1].indexOf("Email") );
			});
		});
		it("should be able to recognize type alias", function() {
			schema = type.object({
				login: String
				, email: String
			});
			strictEqual( schema.val( { login: "123" } ).val().login, "123" );
		});
	});
});


