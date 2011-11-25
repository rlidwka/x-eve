
/**
* string type.
*/

var validator = require("./validator.js");
var type = require("./type.js");
var message = require("./message.js");

var _trimRe = /^\s+|\s+$/g
, _trim = trim = String.prototype.trim;
function trim(val) {
	return val && ( _trim ? _trim.call( val ) : val.replace( _trimRe, "" ) );
}

type.extend( "string", {
	len: function( minOrLen, max, msg ) {
		var last = arguments[ arguments.length - 1 ];
		msg = typeof last == "number" ? null : last;
		this.validators.push( function( str ) {
			return validator.len(minOrLen, max);
		}, message("len", msg) );
		return this;	
	}
	, match: function( re, msg ) {
		this.validators.push( function( str ) {
			return str && str.match( re ) ? true : false;
		}, message("match", msg) );
		return this;	
	}
	, email: function( msg ) {
		this.validators.push( function( str ) {
			return str && validator.isEmail(str) ? true : false;
		}, message("email", msg) );
		return this;	
	}
	, url: function( msg ) {
		this.validators.push( function( str ) {
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

