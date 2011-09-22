var validator = required("./validator.js");
var message = required("./message.js");

var type = module.exports = {};

var any = function(){
	this.type = "any";
	this.rules = [];
	this.validators = [];
};

any.check = function(){
	return true;
}

any.prototype = {
	required: function( msg ) {
		msg = msg || message["string.required"];
		this.rules.push(["required", msg]);
		this.validators.push([ function(val){
			return validator.exists(val);
		}, msg ]);
		return this;
	}
	, sync: function(fn, msg) {
		this.validators.push([fn, msg]);
	}
	, async: function(fn, msg) {
		this.validators.push([fn, msg, true]);
	}
	, validate: function(str, callback) {
		var validators = this.validators
		, len = validators.length
		, completed = 0
		, errors = [];
		iterate();
		return error();
		function iterate(){
			var validator = validators[completed];
			if( validator[2] ){
				//async
				validator[0].call(null, str, function(ok) {
					if(!ok){
						errors.push( validator[1] );
					}
					next();
				});
			} else {
				//sync
				if( !validator[0].call(null, str) ) {
					errors.push( validator[1] );
				}
				next();
			}
		}
		function next(){
			completed++;
			if( completed === len ) {
				callback && callback(error());
			}else{
				iterate();
			}
		}
		function error(){
			return errors.length && errors;
		}
	}
};
any.prototype.exists = any.prototype.required;
