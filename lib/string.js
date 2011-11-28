
/**
* string type.
*/

var validator = require("./validator.js");
var type = require("./type.js");
var message = require("./message.js");

var _trimRe = /^\s+|\s+$/g
, _trim = String.prototype.trim;
function trim(val) {
	return val && ( _trim ? _trim.call( val ) : val.replace( _trimRe, "" ) );
}

type.extend( "string", {
	len: function( minOrLen, max, msg ) {
		var last = arguments[ arguments.length - 1 ];
		msg = typeof last == "number" ? null : last;
		this.validator( function( str ) {
			return validator.len(str, minOrLen, max);
		}, (typeof max == "number" ) ? message("len_in", msg, {min: minOrLen, max: max}) : message("len", msg, {len: minOrLen}) );
		return this;	
	}
	, match: function( re, msg ) {
		this.validator( function( str ) {
			return str && str.match( re ) ? true : false;
		}, message("match", msg, {expression: "" + re}) );
		return this;	
	}
	, enum: function(items, msg) {
		this.validator(function( str ) {
			return validator.contains( items, str );
		}, message("enum", msg, {items: items.join(",")}) );
		return this;
	}
	, email: function( msg ) {
		this.validator( function( str ) {
			return str && validator.isEmail(str) ? true : false;
		}, message("email", msg) );
		return this;	
	}
	, url: function( msg ) {
		this.validator( function( str ) {
			return str && validator.isUrl(str) ? true : false;
		}, message("url", msg) );
		return this;	
	}
	, lowercase: function() {
		this.processors.push( function(str) {
			return str ? str.toLowerCase() : str;
		} );
		return this;
	}
	, uppercase: function() {
		this.processors.push( function(str) {
			return str ? str.toUpperCase() : str;
		} );
		return this;
	}
	, trim: function() {
		this.processors.push( function(str) {
			return str ? trim( str ) : str;
		} );
		return this;
	}
}, {
	check: function(obj){
		return validator.isString(obj);
	}
	, from: function(obj){
		return obj ? String(obj) : obj;
	}
} );

