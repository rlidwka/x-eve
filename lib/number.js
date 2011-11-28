
/**
* number and integer type.
*/

var validator = require("./validator.js");
var type = require("./type.js");
var message = require("./message.js");

var numberInstance = {
	min: function(val, msg) {
		this.validator(function( num ) {
			return num >= val;
		}, message("min", msg, {count: val}) );
		return this;
	}
	, max: function(val, msg) {
		this.validator(function( num ) {
			return num <= val;
		}, message("max", msg, {count: val}) );
		return this;
	}
	, enum: function(items, msg) {
		this.validator(function( num ) {
			return validator.contains( items, num );
		}, message("enum", msg, {items: items.join(",")}) );
		return this;
	}
}

type.extend( "number", numberInstance, {
	check: function( obj ){
		return validator.isNumber( obj );
	}
	, from: function( obj ){
		obj = parseFloat( obj );
		return obj ? obj : ( obj === 0 ? 0 : null );
	}
} );

type.extend( "integer", numberInstance, {
	check: function( obj ){
		return validator.isNumber( obj ) && validator.mod( obj );
	}
	, from: function( obj ){
		obj = parseInt( obj );
		return obj ? obj : ( obj === 0 ? 0 : null );
	}
} );

