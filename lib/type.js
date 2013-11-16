/*
 * any type
 *
 * required,notEmpty,default,validator,processor
 *
 */

var validator = require("./validator.js");
var message = require("./message.js");
var error = require("./error.js");

/**
 * map key -> type 
 * 	type( Date ) => type.date()
 *
 */

var _mapper = {}; 

var type = module.exports = function( key ) {
	if( key && key.type && type[key.type] && (typeof(type['_' + key.type])==='function') && key instanceof type['_' + key.type] ) {
		//Check type
		return key;
	}
	if( key && key.type && type[key.type] && (typeof(type['' + key.type])==='function') && key instanceof type['' + key.type] ) {
		//Check type
		return key;
	}
	key = ( _mapper[key] ? _mapper[key] : null );
	return key && type[ key ] && type[ key ]() || null;
};

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
	// Set/Get alias value
	, alias: function( value ) {
		if( !arguments.length ) {
			return (typeof this._alias == 'function') ? 
				this._alias() : this._alias;
		}
		this._alias = value;
		return this;
	}
	, context: function( context ) {
		this._context = context;
		return this;
	}
	, validator: function(fn, msg) {
		this.validators.push([fn, message("invalid", msg)]);
		return this;
	}
	, processor: function(fn) {
		this.processors.push(fn);
		return this;
	}
	, _validate: function( callback ) {
		return validate( this, this._value, callback, this._context );
	}
	, validate: function( callback ) {
		return this._validate( callback );
	}
	, process: function() {
		this._value = process(this, this._value);
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
				this.validators = [];
				this.processors = [];
				if ( typeof this.init == "function" )
					this.init.apply( this, args.callee ? args : arguments );
			}
			else {
				return new arguments.callee( arguments );
			}
		}
		var valFn = function(value) {
			var self = this;
			if( !arguments.length ) return self._value;
			value = validator.exists(value) ? value : (self.default() || value);
			self._value = (typeof any.from == "function") ? any.from( value ) : value;
			self.process();
			self.afterValue && self.afterValue();
			return self;
		};
		mix( any.prototype, {
			type: name //For check if schema
			, _default: null
			, _value: null
			, _required: false
			, _notEmpty: false
			// Set/Get value
			, value: valFn
			, val: valFn
		} );
		mix( any.prototype, instanceMethods );
		mix( any, staticMethods );
	}
	mix( any.prototype, instance );
	static && static.alias && ( _mapper[static.alias] = name ); //map alias -> type
	mix( any, static );
}

function validate(schema, val, callback, context) {
	var validators = schema.validators
		, len = validators.length
		, required = schema._required
		, notExists = !validator.exists(val)
		, notEmpty = schema._notEmpty
		, completed = 0
		, _errors = new error();

	_errors.alias( schema.alias() );

	//Check required
	if( required && notExists ) {
		_errors.push( required );
		return done();
	}

	if (notExists) {
		return done();
	}

	if (!schema.constructor.check(val)) {
		_errors.push(message("wrongType", "", {
			type: schema.constructor.name
		}));
		return done();
	}

	var empty = !validator.notEmpty(val);
	//Check empty
	if( notEmpty && empty ) {
		_errors.push( notEmpty );
		return done();
	}

	if( !len ) {
		return done();
	}

	iterate();
	return errors();

	function iterate(){
		var validator = validators[completed]
			, fn = validator[0]
			, msg = validator[1]
			, async = true
			, stopWhenError = validator[2];
		//async
		var valid = fn.call(context || null, val, function(ok) {
			if( !async ) return;
			if(!ok){
				_errors.push( msg );
				if( stopWhenError ) return done();
			}
			next();
		});
		//sync valid
		if( typeof valid == "boolean" ) {
			async = false;
			if( !valid ) {
				_errors.push( msg );
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

	function errors(){
		return _errors.ok && _errors || null;
	}

	function done () {
		var e = errors();
		validator.isFunction( callback ) && callback(e);
		return e;
	}
}

function process(schema, val, context) {
	var processors = schema.processors
		, len = processors.length;
	for (var i = 0; i < len; i++) {
		var processor = processors[i];
		val = processor.call(context || null, val);
	};
	return val;
}

extend("any");













    var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };


  type.Base = (function() {

    function Base() {
      this._default = null;
      this._value = null;
      this._required = false;
      this._notEmpty = false;
      this.validators = [];
      this.processors = [];
      this.type = this.constructor.type;
      this.value = this.valFn;
      this.val = this.valFn;
    }

for (var i in instanceMethods) {
	Base.prototype[i] = instanceMethods[i]
}

    Base.prototype.clone = function() {
      var key, obj, val;
      obj = new this.constructor();
      for (key in this) {
        val = this[key];
        if (this.hasOwnProperty(key) && key !== '_value') {
          obj[key] = val;
        }
      }
      return obj;
    };

    Base.prototype.valFn = function(value) {
      if (!arguments.length) {
        return this._value;
      }
      if (validator.exists(value)) {

      } else {
        value = this["default"]() || value;
      }
      if (typeof this.constructor.from === "function") {
        this._value = this.constructor.from(value);
      } else {
        this._value = value;
      }
      this.process();
      this.afterValue && this.afterValue();
      return this;
    };

    Base.check = function() {
      return true;
    };

    Base.from = function(val) {
      return val;
    };

    return Base;

  })();
  type.register = function(name, klass) {
    klass.type = name;
    if (klass.alias) {
      _mapper[klass.alias] = name;
    }
    return type[name] = function(args) {
      return new klass(args);
    };
  };

  type._any = (function(_super) {

    __extends(_any, _super);

    function _any() {
      return _any.__super__.constructor.apply(this, arguments);
    }

    return _any;

  })(type.Base);

  type.register('any', type._any);

