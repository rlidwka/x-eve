
var message = module.exports = function(key, msg, args) {
	var str = msg || message[key]; 
	if( str && args ) {
		str = str.replace(/\{\{(.*?)\}\}/g, function(a,b){
			return args[b] || "";
		});
	}
	return str;
}

message["required"] = "is required";
message["notEmpty"] = "is not empty";
message["len"] = "has max length {{max}} and min length {{min}}";
