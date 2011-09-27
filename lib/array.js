
/**
* array type.
*/

var validator = require("./validator.js");
var type = require("./type.js");
var message = require("./message.js");

type.extend( "array", {
/*
* Init with item schema
* @param {Object} schema
*
*/
	init: function(schema) {
	}
	, len: function(num, msg) {
		this.validators.push(function( ar ) {
			return ar.length === num;
		}, message("len", msg) );
		return this;	
	}
}, {
	check: function(obj){
		return validator.isArray(obj);
	}
	, from: function(obj){
	}
} );


//type.crood = type.array(type.number().min(-90).max(90)).len(2).defined();
//type.crood()


