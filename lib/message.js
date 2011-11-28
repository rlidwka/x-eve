
var message = module.exports = function(key, msg, args) {
	var str = (msg && ("" + msg)) || message[key];
	if( str && args ) {
		str = str.replace(/\{\{(.*?)\}\}/g, function(a,b){
			return args[b] || "";
		});
	}
	return str;
}

message["invalid"] = "is invalid";
message["required"] = "is required";
message["notEmpty"] = "can't be empty";
message["len"] = "should have length {{len}}";
message["len_in"] = "should have max length {{max}} and min length {{min}}";
message["match"] = "should match {{expression}}";
message["email"] = "must be an email address";
message["url"] = "must be a url";

message["min"] = "must be greater than or equal to {{count}}";
message["max"] = "must be less than or equal to {{count}}";

message["enum"] = "must be included in {{items}}";


