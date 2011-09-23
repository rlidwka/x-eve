
/**
* number and integer type.
*/

var validator = require("./validator.js");
var type = require("./type.js");
var message = require("./message.js");

var numberInstance = {
	min: function(val, msg) {
		this.validators.push(function( num ) {
			return num >= val;
		}, message("min", msg) );
		return this;
	}
	, max: function(val, msg) {
		this.validators.push(function( num ) {
			return num <= val;
		}, message("max", msg) );
		return this;
	}
	, enum: function(items, msg) {
		this.validators.push(function( num ) {
			return num <= val;
		}, message("enum", msg) );
		return this;
	}
}

type.extend( "number", numberInstance, {
	check: function(obj){
		return validator.isNumber(obj);
	}
	, from: function(obj){
	}
} );

type.extend( "integer", numberInstance, {
	check: function(obj){
		return validator.isNumber(obj) && validator.mod(obj);
	}
	, from: function(obj){
	}
} );

