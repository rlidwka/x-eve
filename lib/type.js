var validator = require("./validator.js");
var message = require("./message.js");

var type = module.exports = {};
type.extend = extend;

var instanceMethods = {
	init: function(){
	}
	, required: function( msg ) {
		this._required = message("required", msg);
		return this;
	}
	, notEmpty: function( msg ) {
		this._notEmpty = message("notEmpty", msg);
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
		any = type[name] = function( args ) {
			// Return an instance when call any()
			// http://ejohn.org/blog/simple-class-instantiation/
			if ( this instanceof arguments.callee ) {
				if ( typeof this.init == "function" )
					this.init.apply( this, args.callee ? args : arguments );
			}
			else {
				return new arguments.callee( arguments );
			}
		}
		mix( any.prototype, {
			type: name
			, rules: []
			, validators: []
			, processors: []
			, _default: null
			, _value: null
			, _required: false
			, _notEmpty: false
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
	, required = schema._required
	, notExists = !validator.exists(val)
	, notEmpty = schema._notEmpty
	, completed = 0
	, errors = [];

	//Check required
	if( notExists ) {
		required && errors.push( required );
		return done();
	}
	var empty = !validator.notEmpty(val);
	//Check empty
	if( empty ) {
		notEmpty && errors.push( notEmpty );
		return done();
	}

	if( !len ) {
		return done();
	}

	iterate();
	return error();

	function iterate(){
		var validator = validators[completed]
		, fn = validator[0]
		, msg = validator[1]
		, async = true
		, stopWhenError = validator[2];
		//async
		var valid = fn.call(context || null, str, function(ok) {
			if( !async ) return;
			if(!ok){
				errors.push( msg );
				if( stopWhenError ) return done();
			}
			next();
		});
		//sync valid
		if( typeof valid == "boolean" ) {
			async = false;
			if( !valid ) {
				errors.push( msg );
				if( stopWhenError ) return done();
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
		var e = error();
		callback && callback(e);
		return e;
	}
}

extend("any");

