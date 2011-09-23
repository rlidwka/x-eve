var validator = require("./validator.js");
var message = require("./message.js");

var type = module.exports = {};
type.extend = extend;

var instanceMethods = {
	required: function( msg ) {
		msg = message("any.required", msg);
		//this.rules.push(["required", msg]);
		this.validators.unshift([ function(val){
			return validator.exists(val);
		}, msg, true]);
		return this;
	}
	// Set/Get default value
	, default: function(value) {
		if( !arguments.length ) {
			return (typeof this._default == 'function') ? 
				this._default() : this._default;
		}
		this._default = value;
		return this;
	}
	, validator: function(fn, msg) {
		this.validators.push([fn, msg]);
		return this;
	}
	, validate: function(callback) {
		return validate(this, this._value, callback);
	}
};

instanceMethods.exists = instanceMethods.required;

var staticMethods = {
	check: function() {
		return true;
	}
	, from: function(val){
		return val;
	}
}

extend("any", {},  {
	check: function(){
		return true;
	}
	, from： function(val){
		return val;
	}
});

function mix(a, b) {
	if( b ) {
		for ( var prop in b ) {
			a[prop] = b[prop];
		}
	}
	return a;
}

function extend(name, instance, static) {
	if( !name ) return;
	var any = type[name];
	if( !any ) {
		any = type[name] = function(){
			// Return an instance when call any()
			// http://ejohn.org/blog/simple-class-instantiation/
			if ( !( this instanceof arguments.callee ) ) return new arguments.callee( arguments );
		}
		mix( any.prototype, {
			type: name
			, rules: []
			, validators: []
			, processors: []
			, _default: null
			, _value: null
			// Set/Get value
			, value: function(value) {
				if( !arguments.length ) return this._value;
				value = validator.exists(value) ? value : this.getDefault();
				this._value = (typeof any.from == "function") ? any.from( value ) : value;
				return this;
			}
		} );
		mix( any.prototype, instanceMethods );
		mix( any, staticMethods );
	}
	mix( any.prototype, instance );
	mix( any, static );
}

function validate(schema, val, callback, context) {
	var validators = schema.validators
	, len = validators.length
	, isRequired = len && validators[0][2]
	, completed = 0
	, errors = [];
	if( !isRequired && !validator.exists(val) ) {
		done();
	}else{
		iterate();
	}
	return error();
	function iterate(){
		var validator = validators[completed]
		, fn = validator[0]
		, msg = validator[1]
		, async = true
		, isRequired = validator[2];
		//async
		var valid = fn.call(context || null, str, function(ok) {
			if( !async ) return;
			if(!ok){
				errors.push( msg );
				if( isRequired ) return done();
			}
			next();
		});
		//sync valid
		if( typeof valid == "boolean" ) {
			async = false;
			if( !valid ) {
				errors.push( msg );
				if( isRequired ) return done();
			}
			next();
		}
	}
	function next(){
		completed++;
		if( completed === len ) {
			done();
		}else{
			iterate();
		}
	}
	function error(){
		return errors.length && errors || null;
	}
	function done () {
		callback && callback(error());
	}
}

