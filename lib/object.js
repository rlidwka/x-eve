
/**
 * object type.
 */

var validator = require("./validator.js");
var type = require("./type.js");
var message = require("./message.js");
var error = require("./error.js");

type.extend( 
	"object", 
	{
		/*
		 * schema
		 */
		init: function(schema) {
			var self = this
				, ar = self.schema = [];
			push( null, schema );
			self.processor(function(val) {
				self.valueChild();
				return val;
			});
			function push (path, val) {
				//{a: [type.number()] }
				if( validator.isArray(val) ) {
					if( path ) ar.push([path, type.array.apply(null, val)]);
				} else if(validator.isObject(val)){
					if(validator.isString(val.type)){
						//type schema
						//{a: type.number() }
						ar.push([path, val]);
					}else{
						//{a: { b: type.number() } }
						for( var key in val ) {
							//"a.b"
							push( path ? (path + "." + key) : key, val[key] );
						}
					}
				}
			}
		}
		, valueChild: function(){
			var ob = this._value
				, schema = this.schema
				, len = schema.length;
			for (var i = 0; i < len; i++) {
				var sc = schema[i];
				var path = new objectPath(ob, sc[0]);
				if( path.exists() ) {
					path.set( sc[1].value(path.get()).value() );
				} else {
					//Cover the last value...
					sc[1].value( null );
				}
			};
			return this;
		}
		, validate: function(ignoreUndefined, callback) {
			if( validator.isFunction( ignoreUndefined ) ) {
				callback = ignoreUndefined;
				ignoreUndefined = false;
			}
			return this.validateChild(ignoreUndefined, callback);
		}
		, validateChild: function(ignoreUndefined, callback) {
			var ob = this._value
				, completed = 0
				, schema = this.schema
				, _errors = new error()
				, len = schema.length;
			iterate();
			return errors();
			function iterate(){
				var sc = schema[completed];
				var path = new objectPath(ob, sc[0]);
				if( ignoreUndefined && !path.exists() ) {
					return next();
				}
				sc[1].validate(ob, function(err){
					if( err ) {
						_errors.push(sc[0], err, sc[1].alias());
					}
					next();
				});
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
				return _errors.length && _errors || null;
			}

			function done () {
				var e = errors();
				callback && callback(e);
				return e;
			}	
		}
	}
	, {
		check: function(obj){
			return validator.isObject(obj);
		}
		, from: function(obj){
			return validator.isObject(obj) ? obj : null;
		}
		, path: objectPath
	} 
);

/**
 * object value at object path...
 *
 * @param {Object} obj {a: {b: "test" } }
 * @param {String} selector  e.b.c
 *
 */

function objectPath(obj, selector){
	//a.b.c
	this.obj = obj;
	this.selector = selector.split(".");
}

var hasOwnProperty = Object.prototype.hasOwnProperty;

objectPath.prototype.exists = function(){
	var val = this.obj
		, selector = this.selector;
	for (var i = 0, len = selector.length; i < len; i++) {
		var key = selector[i];
		if( !val || !hasOwnProperty.call(val, key) ) {
			return false;
		}
		val = val[key];
	}
	return true;
}

objectPath.prototype.get = function(){
	var val = this.obj
		, selector = this.selector;
	for (var i = 0, len = selector.length; i < len; i++) {
		var key = selector[i];
		if( !val || !hasOwnProperty.call(val, key) ) {
			return undefined;
		}
		val = val[key];
	}
	return val;
}

objectPath.prototype.set = function(value){
	var val = this.obj
		, selector = this.selector;
	if( !val) return;

	for (var i = 0, len = selector.length; i < len; i++) {
		var key = selector[i];
		if( i == (len - 1) ) {
			val[key] = value;
		} else {
			if( !val[key] ) {
				val[key] = {};
			}
			val = val[key];
		}
	}
}


