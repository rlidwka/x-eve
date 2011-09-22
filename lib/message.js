
var message = module.exports = function(key, args) {
	var str = message[key]; 
	if( str && args ) {
		str = str.replace(/\{\{(.*?)\}\}/g, function(a,b){
			return args[b] || "";
		});
	}
}

message["string.required"] = "is required";
message["string.len"] = "has max length {{max}} and min length {{min}}";
