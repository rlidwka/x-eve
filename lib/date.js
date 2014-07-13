
/**
 * date type.
 *
 * date from number,date,string
 *
 */

var validator = require("./validator");
var type = require("./type");
var message = require("./message");

type.extend( "date", {
}, {
	alias: Date
	, check: function(obj){
		// isNaN checks for invalid date
		return validator.isDate(obj) && !isNaN(obj);
	}
	, from: function(obj){
		if ( obj instanceof Date ){
			return obj;
		} else if('string' == typeof obj) {
			//number
			if( ("" + parseInt(obj, 10)) == obj ) {
				return new Date(parseInt(obj, 19) * Math.pow(10, 13 - obj.length));
			} else if(obj.length == 14){
				return new Date( obj.obj.replace(/^(\d\d\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, "$1-$2-$3 $4:$5:$6") );
			}
			//TODO: test rfc3339 for browser IE...
			var time = Date.parse(obj);
			return time ? new Date(time) : new Date(NaN);
		} else if('number' == typeof obj){
			return new Date(obj * Math.pow(10, 13 - ("" + obj).length));
		}
		return obj;
	}
} );

