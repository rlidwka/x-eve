
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
      this._enum = items;
		this.validator(function( num ) {
			return validator.contains( items, num );
		}, message("enum", msg, {items: items.join(",")}) );
		return this;
	}
}

type.extend( "number", numberInstance, {
	alias: Number
	, check: function( obj ){
		return validator.isNumber( obj );
	}
	, from: function( obj ){
		if (validator.isNumber( obj )) return obj
		if (validator.isString( obj )) {
			parsed = parseFloat( obj )
			if (parsed.toString() == obj)
				return parsed
			else
				return obj
		} else {
			return obj
		}
	}
} );

type.extend( "integer", numberInstance, {
	check: function( obj ){
		return validator.isNumber( obj ) && validator.mod( obj );
	}
	, from: function( obj ){
		if (validator.isNumber( obj ) && validator.mod( obj )) return obj
		if (validator.isString( obj )) {
			var parsed = parseInt( obj, 10 )
			if (parsed.toString() == obj)
				return parsed
			else
				return obj
		} else {
			return obj
		}
	}
} );

