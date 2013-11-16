
/**
 * bool type.
 *
 */

var validator = require("./validator");
var type = require("./type");
var message = require("./message");

type.extend( "bool", {
}, {
	alias: Boolean
	, check: function(obj){
		return validator.isBoolean(obj);
	}
	, from: function(obj){
		if ( validator.isString(obj) ){
			var val = obj.replace(/^\s+|\s+$/g, '').toLowerCase()
			if (val === 'false') return false
			if (val === 'true') return true
		}
		return obj;
	}
} );

