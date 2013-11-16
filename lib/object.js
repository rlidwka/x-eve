
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
		init: function( schema ) {
			var self = this
				, ar = self.schema = [];
			push( null, schema );
			function push (path, val) {
				var sc = type( val );
				if( sc ) {
					//type schema
					//{a: type.number() }
					ar.push( [ path, sc ] );
				}
				else if( validator.isArray( val ) && type.array ) {
					//{a: [type.number()] }
					if( path ) ar.push( [ path, type.array.apply(null, val) ] );
				} else if( validator.isObject(val) ) {
					//{a: { b: type.number() } }
					for( var key in val ) {
						//"a.b"
						push( path ? (path + "." + key) : key, val[key] );
					}
				}
			}
		}
		, afterValue: function() {
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
					var default_ = sc[1].value(null).value();
					if (default_) {
						path.set(default_);
					} else {
						sc[1].value(null);
					}
				}
			};
			return this;
		}
		, validate: function( callback ) {
			var self  = this;
			var er1
				, er2 = this._validate( function( err ) {
					er1 = self.validateChild( err, false, callback );
				} );
			return er1 || er2;
		}
		//, validate: function() {
		//	
		//}
		, validateChild: function(err, ignoreUndefined, callback) {
			var ob = this._value
				, completed = 0
				, schema = this.schema
				, _errors = err || new error()
				, len = schema.length;
			iterate();
			return errors();
			function iterate(){
				var sc = schema[completed];
				var path = new objectPath(ob, sc[0]);
				if (ob === null) return next()
				if( ignoreUndefined && !path.exists() ) {
					return next();
				}
				sc[1].context(ob).validate( function(err) {
					if( err ) {
						_errors.on(sc[0], err);
					}
					next();
				}, ignoreUndefined );
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
				callback && callback(e);
				return e;
			}	
		}
	}
	, {
		alias: Object
		, check: function(obj) {
			return validator.isObject(obj);
		}
		, from: function(obj) {
			return validator.exists(obj) ? (validator.isObject(obj) ? obj : null) : obj;
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

