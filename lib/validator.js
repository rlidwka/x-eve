/*!
* validator lib
*
* Copyright (c) 2011 Hidden
* Released under the MIT, BSD, and GPL Licenses.
*
* Date: 2011-09-21
*/

var toString = Object.prototype.toString;

var class2type = {};
// Populate the class2type map
var types = "Boolean Number String Function Array Date RegExp Object".split(" ");
for (var i = types.length - 1; i >= 0; i--) {
	class2type[ "[object " + types[i] + "]" ] = types[i].toLowerCase();
}

function type( obj ) {
	return obj == null ?
		String( obj ) :
			class2type[ toString.call(obj) ] || "object";
}

var validator = module.exports = {
	isArray: function(obj) {
		return type(obj) == "array";
	}
	, isNumber: function(obj) {
		return type(obj) == "number";
	}
	, isFunction: function(obj) {
		return type(obj) == "function";
	}
	, isDate: function(obj) {
		return type(obj) == "date";
	}
	, isRegExp: function(obj) {
		return type(obj) == "regexp";
	}
	, isBoolean: function(obj) {
		return type(obj) == "boolean";
	}
	, isString: function(obj) {
		return type(obj) == "string";
	}
	, isInteger: function(obj) {
		return type(obj) == "number" && !(obj % 1);
	}
	, isEmail: function(str) {
		return !!(str && str.match(/^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/));
	}
	, isUrl: function(str) {
		return !!(str && str.match(/^(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?((?:(?:[-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2}))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/));
	}
	, isAlpha: function(str) {
		return !!(str && str.match(/^[a-zA-Z]+$/));
	}
	, isNumeric: function(str) {
		return !!(str && str.match(/^-?[0-9]+$/));
	}
	, isIp: function(str) {
		return !!(str && str.match(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/));
	}
	, exists: function(obj) {
		return obj !== null && obj !== undefined;
	}
	, notEmpty: function(obj) {
		return !!(obj && !(obj + '').match(/^[\s\t\r\n]*$/));
	}
	, equals: function(obj, eql) {
		return obj === eql;
	}
	/**
	* obj must contains items
	*
*/
	, contains: function(obj, item) {
		if( !obj ) return false;
		var t = type(obj);
		if( type(obj.indexOf) == "function" ) {
			return t.indexOf(item) != -1;
		} else if( t == "array" ) {
			//borwser ie
			var n = -1;
			for (var i = obj.length - 1; i >= 0; i--) {
				if( obj[i] == item ) {
					n = i;
				}
			}
			return n != -1;
		}
		return false;
	}
	, len: function(obj, min, max) {
		if( !obj ) return false;
		if( typeof min == 'number' && obj.length < min ) return false;
		if( typeof max == 'number' && obj.length > max ) return false;
		return true;
	}
	, mod: function(val, by, rem) {
		return val % (by || 1) === ( rem || 0 );
	}
};

