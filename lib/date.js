
/**
* date type.
*
* date from number,date,string
*
*/

var validator = require("./validator.js");
var type = require("./type.js");
var message = require("./message.js");

type.extend( "date", {
}, {
	check: function(obj){
		return validator.isDate(obj);
	}
	, from: function(obj){
		if ( obj instanceof Date ){
			return obj;
		} else if('string' == typeof obj) {
			//number
			if( ("" + parseInt(obj)) == obj ) {
				return new Date(parseInt(obj) * Math.pow(10, 13 - obj.length));
			} else if(obj.length == 14){
				return new Date( obj.obj.replace(/^(\d\d\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, "$1-$2-$3 $4:$5:$6") );
			}
			//TODO: test rfc3339 for browser IE...
			var time = Date.parse(obj);
			return time ? new Date(time) : null;
		} else if('number' == typeof obj){
			return new Date(obj * Math.pow(10, 13 - ("" + obj).length));
		}
		return obj ? null : obj;
	}
} );


