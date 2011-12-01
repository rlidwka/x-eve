/*
*
* i18n from:
* https://github.com/svenfuchs/rails-i18n/tree/master/rails/locale
*
*/

var message = module.exports = function(key, msg, args) {
	var dict = message.dictionary[message._locale];
	var str = (msg && ("" + msg)) || (dict && dict[key]) || "is invalid";
	if( str && args ) {
		str = str.replace(/\{\{(.*?)\}\}/g, function(a,b){
			return args[b] || "";
		});
	}
	return str;
}

message.dictionary = {};
message._locale = 'en-US';

message.locale = function( name ) {
	if( !arguments.length ) {
		//getter
		return message._locale;
	}

	//Store messages in message-en-US.js
	var path = __dirname + "/message-" + name + ".js";
	try{
		require( path );
	}catch(e){
		//console.log("Not found: " + path);
	}

	message._locale = name;
};

message.store = function(locale, data){
	var dict = message.dictionary;
	if ( typeof dict[locale] != "object") {
		dict[locale] = {};
	}
	dict = dict[locale];
	if( data && typeof data == "object" ){
		for( var key in data ){
			dict[key] = data[key];
		}
	}
};

message.store( "en-US", {
	"invalid": "is invalid",
	"required": "is required",
	"notEmpty": "can't be empty",
	"len": "should have length {{len}}",
	"len_in": "should have max length {{max}} and min length {{min}}",
	"match": "should match {{expression}}",
	"email": "must be an email address",
	"url": "must be a url",
	"min": "must be greater than or equal to {{count}}",
	"max": "must be less than or equal to {{count}}",
	"taken": "has already been taken",
	"enum": "must be included in {{items}}"
} );

