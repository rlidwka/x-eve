require("./helper.js");

describe("examples", function() {
	describe("signup_user", function() {
		var type = eve.type;
		var user = {
			login: "test"
			, name: "Test"
			, email: "test@mail.com"
			, password: "test"
			, password_confirmation: "test"
			, birthday: "1990-1-1"
			, age: "20"
		};

		var schema = type.object({
			login: type.string().lowercase().trim().notEmpty().len(3,12).match(/^[a-zA-Z0-9]*$/).validator(function(val, done) {
				setTimeout(function() {
					done(val != "admin");
				}, 100);
			}, "must be unique")
			, name: type.string().trim().notEmpty()
			, email: type.string().trim().notEmpty().email()
			, password: type.string().trim().notEmpty().len(6,12)
			, password_confirmation: type.string().trim().notEmpty().len(6,12).validator(function(val){
				return val == this.password;
			}, "must be equal to password")
			, birthday: type.date()
			, age: type.integer()
		});

		schema.value(user).validate(function(errors) {

		});
	});
});
