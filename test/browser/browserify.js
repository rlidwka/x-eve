;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
	add all tests here that should be served to the browser
*/

require('./test/and.test.js');
require('./test/array.test.js');
require('./test/bool.test.js');
require('./test/error.test.js');
require('./test/examples.test.js');
require('./test/extend.test.js');
require('./test/message.test.js');
require('./test/number.test.js');
require('./test/object.test.js');
require('./test/or.test.js');
require('./test/string.test.js');
require('./test/type.test.js');
require('./test/validator.test.js');

},{"./test/and.test.js":52,"./test/array.test.js":53,"./test/bool.test.js":54,"./test/error.test.js":55,"./test/examples.test.js":56,"./test/extend.test.js":57,"./test/message.test.js":59,"./test/number.test.js":60,"./test/object.test.js":61,"./test/or.test.js":62,"./test/string.test.js":63,"./test/type.test.js":64,"./test/validator.test.js":65}],2:[function(require,module,exports){
/**
 * "and"
 *
 */

var validator = require("./validator");
var type = require("./type");
var message = require("./message");
var error = require("./error");

type.extend( "and", {
	init: function( schemas ) {
		this.schemas = schemas
	},

	validate: function(callback) {
		var er1, er2, self = this;
		if (this._value == null) {
			er2 = this._validate(function(err) {
				if (callback) {
					return callback(err);
				}
			});
		} else {
			er2 = this._validate(function(err) {
				return er1 = self.validateChild(err, callback);
			});
		}
		return er1 || er2;
	},

	afterValue: function() {
		this.validate();
		
		var schemas = this._valid_schemas
		if (schemas) {
			for (var i = 0; i < schemas.length; i++) {
				this._value = schemas[i].val(this._value).val();
			}
		}
		return this;
	},

	validateChild: function(err, callback) {
		var ob = this._value
		  , self = this
		  , completed = 0
		  , schemas = this.schemas
		  , _errors = err || new error()
		  , len = schemas.length

		this._valid_schemas = []
		iterate()
		return errors()

		function iterate(){
			var schema = schemas[completed];
			schema.val( ob ).validate( function(err){
				if (!err) {
					self._valid_schemas.push(schema);
				} else {
					_errors.on(completed, err);
				}
				next();
			});
		}

		function next(){
			completed++;
			if( completed === len ) {
				return done();
			}
			iterate();
		}

		function errors(){
			if (self._valid_schemas.length === len) return null;
			return _errors.ok && _errors || null;
		}

		function done () {
			var e = errors();
			callback && callback(e);
			return e;
		}	
	},
}, {
} );


},{"./error":6,"./message":9,"./type":14,"./validator":15}],3:[function(require,module,exports){
/**
 * array type.
 */

var validator = require("./validator.js");
var type = require("./type.js");
var message = require("./message.js");
var error = require("./error");

type.extend( "array", {

	/**
	 * Init with item schema
	 * @param {Object} schema
	 *
	 */
	init: function( schema ) {
		var sc = type( schema );
		if( !sc && validator.isObject( schema ) && type.object ) {
			sc = type.object( schema );
		}
		this.schema = sc;
	}
	, len: function( minOrLen, max, msg ) {
		var last = arguments[ arguments.length - 1 ];
		msg = typeof last == "number" ? null : last;
		this.validator( function( ar ) {
			return validator.len(ar, minOrLen, max);
		}, (typeof max == "number" ) ? message("len_in", msg, {min: minOrLen, max: max}) : message("len", msg, {len: minOrLen}) );
		return this;		
	}
	, afterValue: function() {
		var ob = this._value
			, schema = this.schema
			, len = ob && ob.length;

		if( schema && len ) {
			for (var i = 0; i < len; i++) {
				ob[ i ] = schema.val( ob[ i] ).val();
			};
		}
		return this;
	}
	, validate: function( callback ) {
		var self  = this
		var er1, er2
		if (self._value == null || self._value.length == 0 || !validator.isArray(self._value)){
			er2 = self._validate(function (err) {if(callback) callback(err)})
		} else {
			er2 = this._validate( function( err ) {
				er1 = self.schema && self._value && self._value.length && self.validateChild( err, callback ) || null;
			} );
		}
		return er1 || er2;
	}
	, validateChild: function(err, callback) {
		var ob = this._value
			, completed = 0
			, schema = this.schema
			, _errors = err || new error()
			, len = ob.length;
		iterate();
		return errors();

		function iterate(){
			var item = ob[completed];
			schema.val( item ).validate( function(err){
				if( err ) {
					_errors.on(completed, err);
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
			return _errors.ok && _errors || null;
		}

		function done () {
			var e = errors();
			callback && callback(e);
			return e;
		}	
	}

}, {
	alias: Array
	, check: function(obj){
		return validator.isArray(obj);
	}
	, from: function(obj){
		if( validator.exists( obj ) ) {
			if ( typeof obj === "string" ) {
				return obj.split(",");
			} else {
				return obj
			}
		} else {
			return obj;
		}
	}
} );

//type.crood = type.array(type.number().min(-90).max(90)).len(2).defined();
//type.crood()


},{"./error":6,"./message.js":9,"./type.js":14,"./validator.js":15}],4:[function(require,module,exports){

/**
 * bool type.
 *
 */

var validator = require("./validator");
var type = require("./type");
var message = require("./message");

type.extend( "bool", {
}, {
	alias: Boolean
	, check: function(obj){
		return validator.isBoolean(obj);
	}
	, from: function(obj){
		if ( validator.isString(obj) ){
			var val = obj.replace(/^\s+|\s+$/g, '').toLowerCase()
			if (val === 'false') return false
			if (val === 'true') return true
		}
		return obj;
	}
} );


},{"./message":9,"./type":14,"./validator":15}],5:[function(require,module,exports){

/**
 * date type.
 *
 * date from number,date,string
 *
 */

var validator = require("./validator");
var type = require("./type");
var message = require("./message");

type.extend( "date", {
}, {
	alias: Date
	, check: function(obj){
		return validator.isDate(obj);
	}
	, from: function(obj){
		if ( obj instanceof Date ){
			return obj;
		} else if('string' == typeof obj) {
			//number
			if( ("" + parseInt(obj, 10)) == obj ) {
				return new Date(parseInt(obj, 19) * Math.pow(10, 13 - obj.length));
			} else if(obj.length == 14){
				return new Date( obj.obj.replace(/^(\d\d\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, "$1-$2-$3 $4:$5:$6") );
			}
			//TODO: test rfc3339 for browser IE...
			var time = Date.parse(obj);
			return time ? new Date(time) : null;
		} else if('number' == typeof obj){
			return new Date(obj * Math.pow(10, 13 - ("" + obj).length));
		}
		return obj ? null : obj;
	}
} );


},{"./message":9,"./type":14,"./validator":15}],6:[function(require,module,exports){
/**
 * error output
 */

var validator = require("./validator.js");

module.exports = error;

function error() {
	var self = this;
	Error.call( self );
	Error.captureStackTrace && Error.captureStackTrace( self, arguments.callee );
	self.ok = false;
	self.name = 'EveError';

	self._messages = [];
	self._hasChildren = false;
	self._chlidrens = {};
};

error.prototype = new Error;
error.prototype.constructor = error;

error.prototype.toString = function() {
	return this.name + ': ' + this.message;
}

error.prototype.alias = function(name) {
	this._alias = name;
};

error.prototype.push = function( msg ) {
	var self = this;
	self._messages.push( msg );
	self.message = concat(self.message, (self._alias ? (self._alias + " ") : "") + msg);
	self.ok = true;
};

/**
 *
 */

error.prototype.on = function( key, er ) {
	var l = arguments.length;
	if(  l == 1 ) {
		return this._chlidrens[ key ] || null;
	} else if( er instanceof error ) {
		this._hasChildren = true;
		if( !this.ok ) {
			this.ok = er.ok;
		}
		this._chlidrens[ key ] = er;
		this.message = concat(this.message, er.message);
	}
};

error.prototype.at = error.prototype.on;

error.prototype.messages = function( withoutName ) {
	var messages = []
		, _msgs = this._messages
		, name = withoutName ? '' : ( this._alias || '');

	name = name ? (name + " ") : "";

	for (var i = 0, l = _msgs.length; i < l; i++) {
		messages.push( name + _msgs[ i ] );
	}

	if ( this._hasChildren ) {
		for ( var key in this._chlidrens ) {
			merge( messages, this._chlidrens[ key ].messages(withoutName) );
		};
	}

	return messages.length ? messages : null;
};

function concat (s1, s2) {
	return s1 && s2 ? (s1 + "\n" + s2) : ( s1 || s2 );
}

function merge (ar1, ar2) {
	if( !ar2 ) return;
	for (var i = 0, l = ar2.length; i < l; i++) {
		ar1.push( ar2[i] );
	};
}


},{"./validator.js":15}],7:[function(require,module,exports){
/*!
*
* EVE
*
* A JavaScript object schema, processor and validation lib.
*
* Copyright (c) 2011 Hidden
* Released under the MIT, BSD, and GPL Licenses.
*
*/

var eve = exports;
var validator = require("./validator.js");
var type = require("./type.js");

require("./number.js");
require("./string.js");
require("./date.js");
require("./object.js");
require("./array.js");
require("./or");
require("./and");
require("./bool");

/**
* Basic validator
*/

eve.validator = validator;

/**
* Schema type
*/

eve.type = type;

/**
* Error message
*/
eve.message = require("./message.js");

/**
* Error object
*/
eve.error = require("./error.js");


},{"./and":2,"./array.js":3,"./bool":4,"./date.js":5,"./error.js":6,"./message.js":9,"./number.js":10,"./object.js":11,"./or":12,"./string.js":13,"./type.js":14,"./validator.js":15}],8:[function(require,module,exports){

var message = require("./message.js");

message.store( "zh-CN", {
	"invalid": "是无效的",
	"required": "必填",
	"notEmpty": "不能留空",
	"len": "长度为{{len}}",
	"len_in": "长度为{{min}}到{{max}}",
	"match": "应该{{expression}}",
	"email": "必须是邮件地址",
	"url": "必须是链接",
	"min": "必须大于或等于 {{count}}",
	"max": "必须小于或等于 {{count}}",
	"taken": "已经被使用",
	"enum": "必须包含在({{items}})中"
} );

},{"./message.js":9}],9:[function(require,module,exports){
var __dirname="/lib";/*
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


},{}],10:[function(require,module,exports){

/**
 * number and integer type.
 */

var validator = require("./validator.js");
var type = require("./type.js");
var message = require("./message.js");

var numberInstance = {
	min: function(val, msg) {
		this.validator(function( num ) {
			return num >= val;
		}, message("min", msg, {count: val}) );
		return this;
	}
	, max: function(val, msg) {
		this.validator(function( num ) {
			return num <= val;
		}, message("max", msg, {count: val}) );
		return this;
	}
	, enum: function(items, msg) {
      this._enum = items;
		this.validator(function( num ) {
			return validator.contains( items, num );
		}, message("enum", msg, {items: items.join(",")}) );
		return this;
	}
}

type.extend( "number", numberInstance, {
	alias: Number
	, check: function( obj ){
		return validator.isNumber( obj );
	}
	, from: function( obj ){
		if (validator.isNumber( obj )) return obj
		if (validator.isString( obj )) {
			var parsed = parseFloat( obj )
			if (parsed.toString() == obj)
				return parsed
			else
				return obj
		} else {
			return obj
		}
	}
} );

type.extend( "integer", numberInstance, {
	check: function( obj ){
		return validator.isNumber( obj ) && validator.mod( obj );
	}
	, from: function( obj ){
		if (validator.isNumber( obj ) && validator.mod( obj )) return obj
		if (validator.isString( obj )) {
			var parsed = parseInt( obj, 10 )
			if (parsed.toString() == obj)
				return parsed
			else
				return obj
		} else {
			return obj
		}
	}
} );


},{"./message.js":9,"./type.js":14,"./validator.js":15}],11:[function(require,module,exports){

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
			  , len = schema.length
			  , ob_copy = ob ? {} : ob

			for (var i = 0; i < len; i++) {
				var sc = schema[i];
				var oldpath = new objectPath(ob, sc[0]);
				var newpath = new objectPath(ob_copy, sc[0]);
				if( oldpath.exists() ) {
					newpath.set( sc[1].value(oldpath.get()).value() );
				} else {
					//Cover the last value...
					var default_ = sc[1].value(null).value();
					if (default_) {
						newpath.set(default_);
					} else {
						sc[1].value(null);
					}
				}
			};
			this._value = ob_copy
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


},{"./error.js":6,"./message.js":9,"./type.js":14,"./validator.js":15}],12:[function(require,module,exports){
/**
 * "or"
 *
 */

var validator = require("./validator");
var type = require("./type");
var message = require("./message");
var error = require("./error");

type.extend( "or", {
	init: function( schemas ) {
		this.schemas = schemas
	},

	validate: function(callback) {
		var er1, er2, self;
		self = this;
		if (this._value == null) {
			er2 = this._validate(function(err) {
				if (callback) {
					return callback(err);
				}
			});
		} else {
			er2 = this._validate(function(err) {
				return er1 = self.validateChild(err, callback);
			});
		}
		return er1 || er2;
	},

	afterValue: function() {
		this.validate();
		if (this._valid_schema) {
			this._value = this._valid_schema.val(this._value).val();
		}
		return this;
	},

	validateChild: function(err, callback) {
		var ob = this._value
		  , self = this
		  , completed = 0
		  , schemas = this.schemas
		  , _errors = err || new error()
		  , len = schemas.length

		this._valid_schema = null
		iterate()
		return errors()

		function iterate(){
			var schema = schemas[completed];
			schema.val( ob ).validate( function(err){
				if (!err) {
					self._valid_schema = schema;
					return next();
				} else {
					_errors.on(completed, err);
				}
				next();
			});
		}

		function next(){
			completed++;
			if( self._valid_schema || completed === len ) {
				done();
			}else{
				iterate();
			}
		}

		function errors(){
			if (self._valid_schema) return null;
			return _errors.ok && _errors || null;
		}

		function done () {
			var e = errors();
			callback && callback(e);
			return e;
		}	
	},
}, {
} );


},{"./error":6,"./message":9,"./type":14,"./validator":15}],13:[function(require,module,exports){

/**
 * string type.
 */

var validator = require("./validator.js")
	, type = require("./type.js")
	, message = require("./message.js")
	, _trimRe = /^\s+|\s+$/g
	, _trim = String.prototype.trim;

function trim(val) {
	return val && ( _trim ? _trim.call( val ) : val.replace( _trimRe, "" ) );
}

type.extend( "string", {
	len: function( minOrLen, max, msg ) {
		var last = arguments[ arguments.length - 1 ];
		msg = typeof last == "number" ? null : last;
		this.validator( function( str ) {
			return validator.len(str, minOrLen, max);
		}, (typeof max == "number" ) ? message("len_in", msg, {min: minOrLen, max: max}) : message("len", msg, {len: minOrLen}) );
		return this;	
	}
	, match: function( re, msg ) {
		this.validator( function( str ) {
			return str && str.match( re ) ? true : false;
		}, message("match", msg, {expression: "" + re}) );
		return this;	
	}
	, enum: function(items, msg) {
		this._enum = items
		this.validator(function( str ) {
			return validator.contains( items, str );
		}, message("enum", msg, {items: items.join(",")}) );
		return this;
	}
	, email: function( msg ) {
		this._email = true
		this.validator( function( str ) {
			return str && validator.isEmail(str) ? true : false;
		}, message("email", msg) );
		return this;	
	}
	, url: function( msg ) {
		this._url = true
		this.validator( function( str ) {
			return str && validator.isUrl(str) ? true : false;
		}, message("url", msg) );
		return this;	
	}
	, lowercase: function() {
		this.processors.push( function(str) {
			return str ? str.toLowerCase() : str;
		} );
		return this;
	}
	, uppercase: function() {
		this.processors.push( function(str) {
			return str ? str.toUpperCase() : str;
		} );
		return this;
	}
	, trim: function() {
		this.processors.push( function(str) {
			return str ? trim( str ) : str;
		} );
		return this;
	}
}, {
	alias: String
	, check: function(obj){
		return validator.isString(obj);
	}
	, from: function(obj){
		if (validator.isNumber(obj))
			return obj.toString()
		else
			return obj
	}
} );


},{"./message.js":9,"./type.js":14,"./validator.js":15}],14:[function(require,module,exports){
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
	, clone: function() {
		var fn = function() {
			this._value = undefined
		}
		fn.prototype = this
		return new fn()
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


},{"./error.js":6,"./message.js":9,"./validator.js":15}],15:[function(require,module,exports){
/*!
 * validator lib
 *
 * Copyright (c) 2011 Hidden
 * Released under the MIT, BSD, and GPL Licenses.
 *
 */

var toString = Object.prototype.toString;

var class2type = {};
// Populate the class2type map
var types = "Boolean Number String Function Array Date RegExp Object".split(" ");
for (var i = types.length - 1; i >= 0; i--) {
	class2type[ "[object " + types[i] + "]" ] = types[i].toLowerCase();
}

function type( obj ) {
	return obj == null ?
		String( obj ) :
		class2type[ toString.call(obj) ] || "object";
}

var validator = module.exports = {
	isArray: function(obj) {
		return type(obj) == "array";
	}
	, isObject: function(obj) {
		//not return null
		return !!obj && type(obj) == "object";
	}
	, isNumber: function(obj) {
		return type(obj) == "number";
	}
	, isFunction: function(obj) {
		return type(obj) == "function";
	}
	, isDate: function(obj) {
		return type(obj) == "date";
	}
	, isRegExp: function(obj) {
		return type(obj) == "regexp";
	}
	, isBoolean: function(obj) {
		return type(obj) == "boolean";
	}
	, isString: function(obj) {
		return type(obj) == "string";
	}
	, isInteger: function(obj) {
		return type(obj) == "number" && !(obj % 1);
	}
	, isEmail: function(str) {
		return !!(str && str.match(/^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/));
	}
	, isUrl: function(str) {
		return !!(str && str.match(/^(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?((?:(?:[-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2}))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/));
	}
	, isAlpha: function(str) {
		return !!(str && str.match(/^[a-zA-Z]+$/));
	}
	, isNumeric: function(str) {
		return !!(str && str.match(/^-?[0-9]+$/));
	}
	, isAlphanumeric: function(str) {
		return !!(str && str.match(/^[a-zA-Z0-9]+$/));
	}
	, isIp: function(str) {
		return !!(str && str.match(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/));
	}
	, exists: function(obj) {
		return obj !== null && obj !== undefined;
	}
	, notEmpty: function(obj) {
		// count empty objects ("{}") as empty
		if (type(obj) === 'object') {
			for (var key in obj) {
				if (obj[key] != null) return true;
			}
			return false;
		}

		// count empty array ("[]") as empty
		if (type(obj) === 'array') {
			return obj.length !== 0;
		}

		// count zero as empty (?)
		if (type(obj) === "number") return obj !== 0;

		return !!(obj !== null && obj !== undefined && !(obj + '').match(/^[\s\t\r\n]*$/));
	}
	, equals: function(obj, eql) {
		return obj === eql;
	}
	/**
	 * obj must contains items
	 *
	 */
	, contains: function(obj, item) {
		if( !obj ) return false;
		var t = type(obj);
		if( type(obj.indexOf) == "function" ) {
			return obj.indexOf(item) != -1;
		} else if( t == "array" ) {
			//borwser ie
			var n = -1;
			for (var i = obj.length - 1; i >= 0; i--) {
				if( obj[i] == item ) {
					n = i;
				}
			}
			return n != -1;
		}
		return false;
	}
	, len: function(obj, minOrLen, max) {
		if( !obj ) return false;
		return typeof max == 'number' ? obj.length >= minOrLen && obj.length <= max : obj.length == minOrLen;
	}
	, mod: function(val, by, rem) {
		return val % (by || 1) === ( rem || 0 );
	}
};


},{}],16:[function(require,module,exports){


//
// The shims in this file are not fully implemented shims for the ES5
// features, but do work for the particular usecases there is in
// the other modules.
//

var toString = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

// Array.isArray is supported in IE9
function isArray(xs) {
  return toString.call(xs) === '[object Array]';
}
exports.isArray = typeof Array.isArray === 'function' ? Array.isArray : isArray;

// Array.prototype.indexOf is supported in IE9
exports.indexOf = function indexOf(xs, x) {
  if (xs.indexOf) return xs.indexOf(x);
  for (var i = 0; i < xs.length; i++) {
    if (x === xs[i]) return i;
  }
  return -1;
};

// Array.prototype.filter is supported in IE9
exports.filter = function filter(xs, fn) {
  if (xs.filter) return xs.filter(fn);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    if (fn(xs[i], i, xs)) res.push(xs[i]);
  }
  return res;
};

// Array.prototype.forEach is supported in IE9
exports.forEach = function forEach(xs, fn, self) {
  if (xs.forEach) return xs.forEach(fn, self);
  for (var i = 0; i < xs.length; i++) {
    fn.call(self, xs[i], i, xs);
  }
};

// Array.prototype.map is supported in IE9
exports.map = function map(xs, fn) {
  if (xs.map) return xs.map(fn);
  var out = new Array(xs.length);
  for (var i = 0; i < xs.length; i++) {
    out[i] = fn(xs[i], i, xs);
  }
  return out;
};

// Array.prototype.reduce is supported in IE9
exports.reduce = function reduce(array, callback, opt_initialValue) {
  if (array.reduce) return array.reduce(callback, opt_initialValue);
  var value, isValueSet = false;

  if (2 < arguments.length) {
    value = opt_initialValue;
    isValueSet = true;
  }
  for (var i = 0, l = array.length; l > i; ++i) {
    if (array.hasOwnProperty(i)) {
      if (isValueSet) {
        value = callback(value, array[i], i, array);
      }
      else {
        value = array[i];
        isValueSet = true;
      }
    }
  }

  return value;
};

// String.prototype.substr - negative index don't work in IE8
if ('ab'.substr(-1) !== 'b') {
  exports.substr = function (str, start, length) {
    // did we get a negative start, calculate how much it is from the beginning of the string
    if (start < 0) start = str.length + start;

    // call the original function
    return str.substr(start, length);
  };
} else {
  exports.substr = function (str, start, length) {
    return str.substr(start, length);
  };
}

// String.prototype.trim is supported in IE9
exports.trim = function (str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
};

// Function.prototype.bind is supported in IE9
exports.bind = function () {
  var args = Array.prototype.slice.call(arguments);
  var fn = args.shift();
  if (fn.bind) return fn.bind.apply(fn, args);
  var self = args.shift();
  return function () {
    fn.apply(self, args.concat([Array.prototype.slice.call(arguments)]));
  };
};

// Object.create is supported in IE9
function create(prototype, properties) {
  var object;
  if (prototype === null) {
    object = { '__proto__' : null };
  }
  else {
    if (typeof prototype !== 'object') {
      throw new TypeError(
        'typeof prototype[' + (typeof prototype) + '] != \'object\''
      );
    }
    var Type = function () {};
    Type.prototype = prototype;
    object = new Type();
    object.__proto__ = prototype;
  }
  if (typeof properties !== 'undefined' && Object.defineProperties) {
    Object.defineProperties(object, properties);
  }
  return object;
}
exports.create = typeof Object.create === 'function' ? Object.create : create;

// Object.keys and Object.getOwnPropertyNames is supported in IE9 however
// they do show a description and number property on Error objects
function notObject(object) {
  return ((typeof object != "object" && typeof object != "function") || object === null);
}

function keysShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.keys called on a non-object");
  }

  var result = [];
  for (var name in object) {
    if (hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// getOwnPropertyNames is almost the same as Object.keys one key feature
//  is that it returns hidden properties, since that can't be implemented,
//  this feature gets reduced so it just shows the length property on arrays
function propertyShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.getOwnPropertyNames called on a non-object");
  }

  var result = keysShim(object);
  if (exports.isArray(object) && exports.indexOf(object, 'length') === -1) {
    result.push('length');
  }
  return result;
}

var keys = typeof Object.keys === 'function' ? Object.keys : keysShim;
var getOwnPropertyNames = typeof Object.getOwnPropertyNames === 'function' ?
  Object.getOwnPropertyNames : propertyShim;

if (new Error().hasOwnProperty('description')) {
  var ERROR_PROPERTY_FILTER = function (obj, array) {
    if (toString.call(obj) === '[object Error]') {
      array = exports.filter(array, function (name) {
        return name !== 'description' && name !== 'number' && name !== 'message';
      });
    }
    return array;
  };

  exports.keys = function (object) {
    return ERROR_PROPERTY_FILTER(object, keys(object));
  };
  exports.getOwnPropertyNames = function (object) {
    return ERROR_PROPERTY_FILTER(object, getOwnPropertyNames(object));
  };
} else {
  exports.keys = keys;
  exports.getOwnPropertyNames = getOwnPropertyNames;
}

// Object.getOwnPropertyDescriptor - supported in IE8 but only on dom elements
function valueObject(value, key) {
  return { value: value[key] };
}

if (typeof Object.getOwnPropertyDescriptor === 'function') {
  try {
    Object.getOwnPropertyDescriptor({'a': 1}, 'a');
    exports.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  } catch (e) {
    // IE8 dom element issue - use a try catch and default to valueObject
    exports.getOwnPropertyDescriptor = function (value, key) {
      try {
        return Object.getOwnPropertyDescriptor(value, key);
      } catch (e) {
        return valueObject(value, key);
      }
    };
  }
} else {
  exports.getOwnPropertyDescriptor = valueObject;
}

},{}],17:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// UTILITY
var util = require('util');
var shims = require('_shims');
var pSlice = Array.prototype.slice;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  this.message = options.message || getMessage(this);
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = shims.keys(a),
        kb = shims.keys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};
},{"_shims":16,"util":18}],18:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var shims = require('_shims');

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  shims.forEach(array, function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = shims.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = shims.getOwnPropertyNames(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }

  shims.forEach(keys, function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = shims.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }

  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (shims.indexOf(ctx.seen, desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = shims.reduce(output, function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return shims.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) && objectToString(e) === '[object Error]';
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.binarySlice === 'function'
  ;
}
exports.isBuffer = isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = shims.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = shims.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

},{"_shims":16}],19:[function(require,module,exports){
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isBE ? 0 : (nBytes - 1),
      d = isBE ? 1 : -1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isBE ? (nBytes - 1) : 0,
      d = isBE ? -1 : 1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],20:[function(require,module,exports){
var assert;
exports.Buffer = Buffer;
exports.SlowBuffer = Buffer;
Buffer.poolSize = 8192;
exports.INSPECT_MAX_BYTES = 50;

function stringtrim(str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
}

function Buffer(subject, encoding, offset) {
  if(!assert) assert= require('assert');
  if (!(this instanceof Buffer)) {
    return new Buffer(subject, encoding, offset);
  }
  this.parent = this;
  this.offset = 0;

  // Work-around: node's base64 implementation
  // allows for non-padded strings while base64-js
  // does not..
  if (encoding == "base64" && typeof subject == "string") {
    subject = stringtrim(subject);
    while (subject.length % 4 != 0) {
      subject = subject + "="; 
    }
  }

  var type;

  // Are we slicing?
  if (typeof offset === 'number') {
    this.length = coerce(encoding);
    // slicing works, with limitations (no parent tracking/update)
    // check https://github.com/toots/buffer-browserify/issues/19
    for (var i = 0; i < this.length; i++) {
        this[i] = subject.get(i+offset);
    }
  } else {
    // Find the length
    switch (type = typeof subject) {
      case 'number':
        this.length = coerce(subject);
        break;

      case 'string':
        this.length = Buffer.byteLength(subject, encoding);
        break;

      case 'object': // Assume object is an array
        this.length = coerce(subject.length);
        break;

      default:
        throw new Error('First argument needs to be a number, ' +
                        'array or string.');
    }

    // Treat array-ish objects as a byte array.
    if (isArrayIsh(subject)) {
      for (var i = 0; i < this.length; i++) {
        if (subject instanceof Buffer) {
          this[i] = subject.readUInt8(i);
        }
        else {
          this[i] = subject[i];
        }
      }
    } else if (type == 'string') {
      // We are a string
      this.length = this.write(subject, 0, encoding);
    } else if (type === 'number') {
      for (var i = 0; i < this.length; i++) {
        this[i] = 0;
      }
    }
  }
}

Buffer.prototype.get = function get(i) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this[i];
};

Buffer.prototype.set = function set(i, v) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this[i] = v;
};

Buffer.byteLength = function (str, encoding) {
  switch (encoding || "utf8") {
    case 'hex':
      return str.length / 2;

    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(str).length;

    case 'ascii':
    case 'binary':
      return str.length;

    case 'base64':
      return base64ToBytes(str).length;

    default:
      throw new Error('Unknown encoding');
  }
};

Buffer.prototype.utf8Write = function (string, offset, length) {
  var bytes, pos;
  return Buffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
};

Buffer.prototype.asciiWrite = function (string, offset, length) {
  var bytes, pos;
  return Buffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
};

Buffer.prototype.binaryWrite = Buffer.prototype.asciiWrite;

Buffer.prototype.base64Write = function (string, offset, length) {
  var bytes, pos;
  return Buffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
};

Buffer.prototype.base64Slice = function (start, end) {
  var bytes = Array.prototype.slice.apply(this, arguments)
  return require("base64-js").fromByteArray(bytes);
};

Buffer.prototype.utf8Slice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var res = "";
  var tmp = "";
  var i = 0;
  while (i < bytes.length) {
    if (bytes[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
      tmp = "";
    } else
      tmp += "%" + bytes[i].toString(16);

    i++;
  }

  return res + decodeUtf8Char(tmp);
}

Buffer.prototype.asciiSlice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var ret = "";
  for (var i = 0; i < bytes.length; i++)
    ret += String.fromCharCode(bytes[i]);
  return ret;
}

Buffer.prototype.binarySlice = Buffer.prototype.asciiSlice;

Buffer.prototype.inspect = function() {
  var out = [],
      len = this.length;
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }
  return '<Buffer ' + out.join(' ') + '>';
};


Buffer.prototype.hexSlice = function(start, end) {
  var len = this.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; i++) {
    out += toHex(this[i]);
  }
  return out;
};


Buffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();
  start = +start || 0;
  if (typeof end == 'undefined') end = this.length;

  // Fastpath empty strings
  if (+end == start) {
    return '';
  }

  switch (encoding) {
    case 'hex':
      return this.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.utf8Slice(start, end);

    case 'ascii':
      return this.asciiSlice(start, end);

    case 'binary':
      return this.binarySlice(start, end);

    case 'base64':
      return this.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


Buffer.prototype.hexWrite = function(string, offset, length) {
  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2) {
    throw new Error('Invalid hex string');
  }
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(byte)) throw new Error('Invalid hex string');
    this[offset + i] = byte;
  }
  Buffer._charsWritten = i * 2;
  return i;
};


Buffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  switch (encoding) {
    case 'hex':
      return this.hexWrite(string, offset, length);

    case 'utf8':
    case 'utf-8':
      return this.utf8Write(string, offset, length);

    case 'ascii':
      return this.asciiWrite(string, offset, length);

    case 'binary':
      return this.binaryWrite(string, offset, length);

    case 'base64':
      return this.base64Write(string, offset, length);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Write(string, offset, length);

    default:
      throw new Error('Unknown encoding');
  }
};

// slice(start, end)
function clamp(index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue;
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len;
  if (index >= 0) return index;
  index += len;
  if (index >= 0) return index;
  return 0;
}

Buffer.prototype.slice = function(start, end) {
  var len = this.length;
  start = clamp(start, len, 0);
  end = clamp(end, len, len);
  return new Buffer(this, end - start, +start);
};

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function(target, target_start, start, end) {
  var source = this;
  start || (start = 0);
  if (end === undefined || isNaN(end)) {
    end = this.length;
  }
  target_start || (target_start = 0);

  if (end < start) throw new Error('sourceEnd < sourceStart');

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length == 0 || source.length == 0) return 0;

  if (target_start < 0 || target_start >= target.length) {
    throw new Error('targetStart out of bounds');
  }

  if (start < 0 || start >= source.length) {
    throw new Error('sourceStart out of bounds');
  }

  if (end < 0 || end > source.length) {
    throw new Error('sourceEnd out of bounds');
  }

  // Are we oob?
  if (end > this.length) {
    end = this.length;
  }

  if (target.length - target_start < end - start) {
    end = target.length - target_start + start;
  }

  var temp = [];
  for (var i=start; i<end; i++) {
    assert.ok(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
    temp.push(this[i]);
  }

  for (var i=target_start; i<target_start+temp.length; i++) {
    target[i] = temp[i-target_start];
  }
};

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill(value, start, end) {
  value || (value = 0);
  start || (start = 0);
  end || (end = this.length);

  if (typeof value === 'string') {
    value = value.charCodeAt(0);
  }
  if (!(typeof value === 'number') || isNaN(value)) {
    throw new Error('value is not a number');
  }

  if (end < start) throw new Error('end < start');

  // Fill 0 bytes; we're done
  if (end === start) return 0;
  if (this.length == 0) return 0;

  if (start < 0 || start >= this.length) {
    throw new Error('start out of bounds');
  }

  if (end < 0 || end > this.length) {
    throw new Error('end out of bounds');
  }

  for (var i = start; i < end; i++) {
    this[i] = value;
  }
}

// Static methods
Buffer.isBuffer = function isBuffer(b) {
  return b instanceof Buffer || b instanceof Buffer;
};

Buffer.concat = function (list, totalLength) {
  if (!isArray(list)) {
    throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
      list should be an Array.");
  }

  if (list.length === 0) {
    return new Buffer(0);
  } else if (list.length === 1) {
    return list[0];
  }

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (var i = 0; i < list.length; i++) {
      var buf = list[i];
      totalLength += buf.length;
    }
  }

  var buffer = new Buffer(totalLength);
  var pos = 0;
  for (var i = 0; i < list.length; i++) {
    var buf = list[i];
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

Buffer.isEncoding = function(encoding) {
  switch ((encoding + '').toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
    case 'raw':
      return true;

    default:
      return false;
  }
};

// helpers

function coerce(length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length);
  return length < 0 ? 0 : length;
}

function isArray(subject) {
  return (Array.isArray ||
    function(subject){
      return {}.toString.apply(subject) == '[object Array]'
    })
    (subject)
}

function isArrayIsh(subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
         subject && typeof subject === 'object' &&
         typeof subject.length === 'number';
}

function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i));
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16));
    }

  return byteArray;
}

function asciiToBytes(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++ )
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push( str.charCodeAt(i) & 0xFF );

  return byteArray;
}

function base64ToBytes(str) {
  return require("base64-js").toByteArray(str);
}

function blitBuffer(src, dst, offset, length) {
  var pos, i = 0;
  while (i < length) {
    if ((i+offset >= dst.length) || (i >= src.length))
      break;

    dst[i + offset] = src[i];
    i++;
  }
  return i;
}

function decodeUtf8Char(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char
  }
}

// read/write bit-twiddling

Buffer.prototype.readUInt8 = function(offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  return buffer[offset];
};

function readUInt16(buffer, offset, isBigEndian, noAssert) {
  var val = 0;


  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    val = buffer[offset] << 8;
    if (offset + 1 < buffer.length) {
      val |= buffer[offset + 1];
    }
  } else {
    val = buffer[offset];
    if (offset + 1 < buffer.length) {
      val |= buffer[offset + 1] << 8;
    }
  }

  return val;
}

Buffer.prototype.readUInt16LE = function(offset, noAssert) {
  return readUInt16(this, offset, false, noAssert);
};

Buffer.prototype.readUInt16BE = function(offset, noAssert) {
  return readUInt16(this, offset, true, noAssert);
};

function readUInt32(buffer, offset, isBigEndian, noAssert) {
  var val = 0;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    if (offset + 1 < buffer.length)
      val = buffer[offset + 1] << 16;
    if (offset + 2 < buffer.length)
      val |= buffer[offset + 2] << 8;
    if (offset + 3 < buffer.length)
      val |= buffer[offset + 3];
    val = val + (buffer[offset] << 24 >>> 0);
  } else {
    if (offset + 2 < buffer.length)
      val = buffer[offset + 2] << 16;
    if (offset + 1 < buffer.length)
      val |= buffer[offset + 1] << 8;
    val |= buffer[offset];
    if (offset + 3 < buffer.length)
      val = val + (buffer[offset + 3] << 24 >>> 0);
  }

  return val;
}

Buffer.prototype.readUInt32LE = function(offset, noAssert) {
  return readUInt32(this, offset, false, noAssert);
};

Buffer.prototype.readUInt32BE = function(offset, noAssert) {
  return readUInt32(this, offset, true, noAssert);
};


/*
 * Signed integer types, yay team! A reminder on how two's complement actually
 * works. The first bit is the signed bit, i.e. tells us whether or not the
 * number should be positive or negative. If the two's complement value is
 * positive, then we're done, as it's equivalent to the unsigned representation.
 *
 * Now if the number is positive, you're pretty much done, you can just leverage
 * the unsigned translations and return those. Unfortunately, negative numbers
 * aren't quite that straightforward.
 *
 * At first glance, one might be inclined to use the traditional formula to
 * translate binary numbers between the positive and negative values in two's
 * complement. (Though it doesn't quite work for the most negative value)
 * Mainly:
 *  - invert all the bits
 *  - add one to the result
 *
 * Of course, this doesn't quite work in Javascript. Take for example the value
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
 * course, Javascript will do the following:
 *
 * > ~0xff80
 * -65409
 *
 * Whoh there, Javascript, that's not quite right. But wait, according to
 * Javascript that's perfectly correct. When Javascript ends up seeing the
 * constant 0xff80, it has no notion that it is actually a signed number. It
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the
 * binary negation, it casts it into a signed value, (positive 0xff80). Then
 * when you perform binary negation on that, it turns it into a negative number.
 *
 * Instead, we're going to have to use the following general formula, that works
 * in a rather Javascript friendly way. I'm glad we don't support this kind of
 * weird numbering scheme in the kernel.
 *
 * (BIT-MAX - (unsigned)val + 1) * -1
 *
 * The astute observer, may think that this doesn't make sense for 8-bit numbers
 * (really it isn't necessary for them). However, when you get 16-bit numbers,
 * you do. Let's go back to our prior example and see how this will look:
 *
 * (0xffff - 0xff80 + 1) * -1
 * (0x007f + 1) * -1
 * (0x0080) * -1
 */
Buffer.prototype.readInt8 = function(offset, noAssert) {
  var buffer = this;
  var neg;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  neg = buffer[offset] & 0x80;
  if (!neg) {
    return (buffer[offset]);
  }

  return ((0xff - buffer[offset] + 1) * -1);
};

function readInt16(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt16(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x8000;
  if (!neg) {
    return val;
  }

  return (0xffff - val + 1) * -1;
}

Buffer.prototype.readInt16LE = function(offset, noAssert) {
  return readInt16(this, offset, false, noAssert);
};

Buffer.prototype.readInt16BE = function(offset, noAssert) {
  return readInt16(this, offset, true, noAssert);
};

function readInt32(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt32(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x80000000;
  if (!neg) {
    return (val);
  }

  return (0xffffffff - val + 1) * -1;
}

Buffer.prototype.readInt32LE = function(offset, noAssert) {
  return readInt32(this, offset, false, noAssert);
};

Buffer.prototype.readInt32BE = function(offset, noAssert) {
  return readInt32(this, offset, true, noAssert);
};

function readFloat(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.readFloatLE = function(offset, noAssert) {
  return readFloat(this, offset, false, noAssert);
};

Buffer.prototype.readFloatBE = function(offset, noAssert) {
  return readFloat(this, offset, true, noAssert);
};

function readDouble(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 7 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.readDoubleLE = function(offset, noAssert) {
  return readDouble(this, offset, false, noAssert);
};

Buffer.prototype.readDoubleBE = function(offset, noAssert) {
  return readDouble(this, offset, true, noAssert);
};


/*
 * We have to make sure that the value is a valid integer. This means that it is
 * non-negative. It has no fractional component and that it does not exceed the
 * maximum allowed value.
 *
 *      value           The number to check for validity
 *
 *      max             The maximum value
 */
function verifuint(value, max) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value >= 0,
      'specified a negative value for writing an unsigned value');

  assert.ok(value <= max, 'value is larger than maximum value for type');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xff);
  }

  if (offset < buffer.length) {
    buffer[offset] = value;
  }
};

function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 2); i++) {
    buffer[offset + i] =
        (value & (0xff << (8 * (isBigEndian ? 1 - i : i)))) >>>
            (isBigEndian ? 1 - i : i) * 8;
  }

}

Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, true, noAssert);
};

function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffffffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 4); i++) {
    buffer[offset + i] =
        (value >>> (isBigEndian ? 3 - i : i) * 8) & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, true, noAssert);
};


/*
 * We now move onto our friends in the signed number category. Unlike unsigned
 * numbers, we're going to have to worry a bit more about how we put values into
 * arrays. Since we are only worrying about signed 32-bit values, we're in
 * slightly better shape. Unfortunately, we really can't do our favorite binary
 * & in this system. It really seems to do the wrong thing. For example:
 *
 * > -32 & 0xff
 * 224
 *
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
 * this aren't treated as a signed number. Ultimately a bad thing.
 *
 * What we're going to want to do is basically create the unsigned equivalent of
 * our representation and pass that off to the wuint* functions. To do that
 * we're going to do the following:
 *
 *  - if the value is positive
 *      we can pass it directly off to the equivalent wuint
 *  - if the value is negative
 *      we do the following computation:
 *         mb + val + 1, where
 *         mb   is the maximum unsigned value in that byte size
 *         val  is the Javascript negative integer
 *
 *
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
 * you do out the computations:
 *
 * 0xffff - 128 + 1
 * 0xffff - 127
 * 0xff80
 *
 * You can then encode this value as the signed version. This is really rather
 * hacky, but it should work and get the job done which is our goal here.
 */

/*
 * A series of checks to make sure we actually have a signed 32-bit number
 */
function verifsint(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

function verifIEEE754(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');
}

Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7f, -0x80);
  }

  if (value >= 0) {
    buffer.writeUInt8(value, offset, noAssert);
  } else {
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);
  }
};

function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fff, -0x8000);
  }

  if (value >= 0) {
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, true, noAssert);
};

function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fffffff, -0x80000000);
  }

  if (value >= 0) {
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, true, noAssert);
};

function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, false, noAssert);
};

Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, true, noAssert);
};

function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 7 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, true, noAssert);
};

},{"./buffer_ieee754":19,"assert":17,"base64-js":21}],21:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}],22:[function(require,module,exports){
module.exports = require('./lib/chai');

},{"./lib/chai":23}],23:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var used = []
  , exports = module.exports = {};

/*!
 * Chai version
 */

exports.version = '1.8.1';

/*!
 * Assertion Error
 */

exports.AssertionError = require('assertion-error');

/*!
 * Utils for plugins (not exported)
 */

var util = require('./chai/utils');

/**
 * # .use(function)
 *
 * Provides a way to extend the internals of Chai
 *
 * @param {Function}
 * @returns {this} for chaining
 * @api public
 */

exports.use = function (fn) {
  if (!~used.indexOf(fn)) {
    fn(this, util);
    used.push(fn);
  }

  return this;
};

/*!
 * Primary `Assertion` prototype
 */

var assertion = require('./chai/assertion');
exports.use(assertion);

/*!
 * Core Assertions
 */

var core = require('./chai/core/assertions');
exports.use(core);

/*!
 * Expect interface
 */

var expect = require('./chai/interface/expect');
exports.use(expect);

/*!
 * Should interface
 */

var should = require('./chai/interface/should');
exports.use(should);

/*!
 * Assert interface
 */

var assert = require('./chai/interface/assert');
exports.use(assert);

},{"./chai/assertion":24,"./chai/core/assertions":25,"./chai/interface/assert":26,"./chai/interface/expect":27,"./chai/interface/should":28,"./chai/utils":39,"assertion-error":47}],24:[function(require,module,exports){
/*!
 * chai
 * http://chaijs.com
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (_chai, util) {
  /*!
   * Module dependencies.
   */

  var AssertionError = _chai.AssertionError
    , flag = util.flag;

  /*!
   * Module export.
   */

  _chai.Assertion = Assertion;

  /*!
   * Assertion Constructor
   *
   * Creates object for chaining.
   *
   * @api private
   */

  function Assertion (obj, msg, stack) {
    flag(this, 'ssfi', stack || arguments.callee);
    flag(this, 'object', obj);
    flag(this, 'message', msg);
  }

  /*!
    * ### Assertion.includeStack
    *
    * User configurable property, influences whether stack trace
    * is included in Assertion error message. Default of false
    * suppresses stack trace in the error message
    *
    *     Assertion.includeStack = true;  // enable stack on error
    *
    * @api public
    */

  Assertion.includeStack = false;

  /*!
   * ### Assertion.showDiff
   *
   * User configurable property, influences whether or not
   * the `showDiff` flag should be included in the thrown
   * AssertionErrors. `false` will always be `false`; `true`
   * will be true when the assertion has requested a diff
   * be shown.
   *
   * @api public
   */

  Assertion.showDiff = true;

  Assertion.addProperty = function (name, fn) {
    util.addProperty(this.prototype, name, fn);
  };

  Assertion.addMethod = function (name, fn) {
    util.addMethod(this.prototype, name, fn);
  };

  Assertion.addChainableMethod = function (name, fn, chainingBehavior) {
    util.addChainableMethod(this.prototype, name, fn, chainingBehavior);
  };

  Assertion.overwriteProperty = function (name, fn) {
    util.overwriteProperty(this.prototype, name, fn);
  };

  Assertion.overwriteMethod = function (name, fn) {
    util.overwriteMethod(this.prototype, name, fn);
  };

  /*!
   * ### .assert(expression, message, negateMessage, expected, actual)
   *
   * Executes an expression and check expectations. Throws AssertionError for reporting if test doesn't pass.
   *
   * @name assert
   * @param {Philosophical} expression to be tested
   * @param {String} message to display if fails
   * @param {String} negatedMessage to display if negated expression fails
   * @param {Mixed} expected value (remember to check for negation)
   * @param {Mixed} actual (optional) will default to `this.obj`
   * @api private
   */

  Assertion.prototype.assert = function (expr, msg, negateMsg, expected, _actual, showDiff) {
    var ok = util.test(this, arguments);
    if (true !== showDiff) showDiff = false;
    if (true !== Assertion.showDiff) showDiff = false;

    if (!ok) {
      var msg = util.getMessage(this, arguments)
        , actual = util.getActual(this, arguments);
      throw new AssertionError(msg, {
          actual: actual
        , expected: expected
        , showDiff: showDiff
      }, (Assertion.includeStack) ? this.assert : flag(this, 'ssfi'));
    }
  };

  /*!
   * ### ._obj
   *
   * Quick reference to stored `actual` value for plugin developers.
   *
   * @api private
   */

  Object.defineProperty(Assertion.prototype, '_obj',
    { get: function () {
        return flag(this, 'object');
      }
    , set: function (val) {
        flag(this, 'object', val);
      }
  });
};

},{}],25:[function(require,module,exports){
/*!
 * chai
 * http://chaijs.com
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai, _) {
  var Assertion = chai.Assertion
    , toString = Object.prototype.toString
    , flag = _.flag;

  /**
   * ### Language Chains
   *
   * The following are provide as chainable getters to
   * improve the readability of your assertions. They
   * do not provide an testing capability unless they
   * have been overwritten by a plugin.
   *
   * **Chains**
   *
   * - to
   * - be
   * - been
   * - is
   * - that
   * - and
   * - have
   * - with
   * - at
   * - of
   * - same
   *
   * @name language chains
   * @api public
   */

  [ 'to', 'be', 'been'
  , 'is', 'and', 'have'
  , 'with', 'that', 'at'
  , 'of', 'same' ].forEach(function (chain) {
    Assertion.addProperty(chain, function () {
      return this;
    });
  });

  /**
   * ### .not
   *
   * Negates any of assertions following in the chain.
   *
   *     expect(foo).to.not.equal('bar');
   *     expect(goodFn).to.not.throw(Error);
   *     expect({ foo: 'baz' }).to.have.property('foo')
   *       .and.not.equal('bar');
   *
   * @name not
   * @api public
   */

  Assertion.addProperty('not', function () {
    flag(this, 'negate', true);
  });

  /**
   * ### .deep
   *
   * Sets the `deep` flag, later used by the `equal` and
   * `property` assertions.
   *
   *     expect(foo).to.deep.equal({ bar: 'baz' });
   *     expect({ foo: { bar: { baz: 'quux' } } })
   *       .to.have.deep.property('foo.bar.baz', 'quux');
   *
   * @name deep
   * @api public
   */

  Assertion.addProperty('deep', function () {
    flag(this, 'deep', true);
  });

  /**
   * ### .a(type)
   *
   * The `a` and `an` assertions are aliases that can be
   * used either as language chains or to assert a value's
   * type.
   *
   *     // typeof
   *     expect('test').to.be.a('string');
   *     expect({ foo: 'bar' }).to.be.an('object');
   *     expect(null).to.be.a('null');
   *     expect(undefined).to.be.an('undefined');
   *
   *     // language chain
   *     expect(foo).to.be.an.instanceof(Foo);
   *
   * @name a
   * @alias an
   * @param {String} type
   * @param {String} message _optional_
   * @api public
   */

  function an (type, msg) {
    if (msg) flag(this, 'message', msg);
    type = type.toLowerCase();
    var obj = flag(this, 'object')
      , article = ~[ 'a', 'e', 'i', 'o', 'u' ].indexOf(type.charAt(0)) ? 'an ' : 'a ';

    this.assert(
        type === _.type(obj)
      , 'expected #{this} to be ' + article + type
      , 'expected #{this} not to be ' + article + type
    );
  }

  Assertion.addChainableMethod('an', an);
  Assertion.addChainableMethod('a', an);

  /**
   * ### .include(value)
   *
   * The `include` and `contain` assertions can be used as either property
   * based language chains or as methods to assert the inclusion of an object
   * in an array or a substring in a string. When used as language chains,
   * they toggle the `contain` flag for the `keys` assertion.
   *
   *     expect([1,2,3]).to.include(2);
   *     expect('foobar').to.contain('foo');
   *     expect({ foo: 'bar', hello: 'universe' }).to.include.keys('foo');
   *
   * @name include
   * @alias contain
   * @param {Object|String|Number} obj
   * @param {String} message _optional_
   * @api public
   */

  function includeChainingBehavior () {
    flag(this, 'contains', true);
  }

  function include (val, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object')
    this.assert(
        ~obj.indexOf(val)
      , 'expected #{this} to include ' + _.inspect(val)
      , 'expected #{this} to not include ' + _.inspect(val));
  }

  Assertion.addChainableMethod('include', include, includeChainingBehavior);
  Assertion.addChainableMethod('contain', include, includeChainingBehavior);

  /**
   * ### .ok
   *
   * Asserts that the target is truthy.
   *
   *     expect('everthing').to.be.ok;
   *     expect(1).to.be.ok;
   *     expect(false).to.not.be.ok;
   *     expect(undefined).to.not.be.ok;
   *     expect(null).to.not.be.ok;
   *
   * @name ok
   * @api public
   */

  Assertion.addProperty('ok', function () {
    this.assert(
        flag(this, 'object')
      , 'expected #{this} to be truthy'
      , 'expected #{this} to be falsy');
  });

  /**
   * ### .true
   *
   * Asserts that the target is `true`.
   *
   *     expect(true).to.be.true;
   *     expect(1).to.not.be.true;
   *
   * @name true
   * @api public
   */

  Assertion.addProperty('true', function () {
    this.assert(
        true === flag(this, 'object')
      , 'expected #{this} to be true'
      , 'expected #{this} to be false'
      , this.negate ? false : true
    );
  });

  /**
   * ### .false
   *
   * Asserts that the target is `false`.
   *
   *     expect(false).to.be.false;
   *     expect(0).to.not.be.false;
   *
   * @name false
   * @api public
   */

  Assertion.addProperty('false', function () {
    this.assert(
        false === flag(this, 'object')
      , 'expected #{this} to be false'
      , 'expected #{this} to be true'
      , this.negate ? true : false
    );
  });

  /**
   * ### .null
   *
   * Asserts that the target is `null`.
   *
   *     expect(null).to.be.null;
   *     expect(undefined).not.to.be.null;
   *
   * @name null
   * @api public
   */

  Assertion.addProperty('null', function () {
    this.assert(
        null === flag(this, 'object')
      , 'expected #{this} to be null'
      , 'expected #{this} not to be null'
    );
  });

  /**
   * ### .undefined
   *
   * Asserts that the target is `undefined`.
   *
   *     expect(undefined).to.be.undefined;
   *     expect(null).to.not.be.undefined;
   *
   * @name undefined
   * @api public
   */

  Assertion.addProperty('undefined', function () {
    this.assert(
        undefined === flag(this, 'object')
      , 'expected #{this} to be undefined'
      , 'expected #{this} not to be undefined'
    );
  });

  /**
   * ### .exist
   *
   * Asserts that the target is neither `null` nor `undefined`.
   *
   *     var foo = 'hi'
   *       , bar = null
   *       , baz;
   *
   *     expect(foo).to.exist;
   *     expect(bar).to.not.exist;
   *     expect(baz).to.not.exist;
   *
   * @name exist
   * @api public
   */

  Assertion.addProperty('exist', function () {
    this.assert(
        null != flag(this, 'object')
      , 'expected #{this} to exist'
      , 'expected #{this} to not exist'
    );
  });


  /**
   * ### .empty
   *
   * Asserts that the target's length is `0`. For arrays, it checks
   * the `length` property. For objects, it gets the count of
   * enumerable keys.
   *
   *     expect([]).to.be.empty;
   *     expect('').to.be.empty;
   *     expect({}).to.be.empty;
   *
   * @name empty
   * @api public
   */

  Assertion.addProperty('empty', function () {
    var obj = flag(this, 'object')
      , expected = obj;

    if (Array.isArray(obj) || 'string' === typeof object) {
      expected = obj.length;
    } else if (typeof obj === 'object') {
      expected = Object.keys(obj).length;
    }

    this.assert(
        !expected
      , 'expected #{this} to be empty'
      , 'expected #{this} not to be empty'
    );
  });

  /**
   * ### .arguments
   *
   * Asserts that the target is an arguments object.
   *
   *     function test () {
   *       expect(arguments).to.be.arguments;
   *     }
   *
   * @name arguments
   * @alias Arguments
   * @api public
   */

  function checkArguments () {
    var obj = flag(this, 'object')
      , type = Object.prototype.toString.call(obj);
    this.assert(
        '[object Arguments]' === type
      , 'expected #{this} to be arguments but got ' + type
      , 'expected #{this} to not be arguments'
    );
  }

  Assertion.addProperty('arguments', checkArguments);
  Assertion.addProperty('Arguments', checkArguments);

  /**
   * ### .equal(value)
   *
   * Asserts that the target is strictly equal (`===`) to `value`.
   * Alternately, if the `deep` flag is set, asserts that
   * the target is deeply equal to `value`.
   *
   *     expect('hello').to.equal('hello');
   *     expect(42).to.equal(42);
   *     expect(1).to.not.equal(true);
   *     expect({ foo: 'bar' }).to.not.equal({ foo: 'bar' });
   *     expect({ foo: 'bar' }).to.deep.equal({ foo: 'bar' });
   *
   * @name equal
   * @alias equals
   * @alias eq
   * @alias deep.equal
   * @param {Mixed} value
   * @param {String} message _optional_
   * @api public
   */

  function assertEqual (val, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'deep')) {
      return this.eql(val);
    } else {
      this.assert(
          val === obj
        , 'expected #{this} to equal #{exp}'
        , 'expected #{this} to not equal #{exp}'
        , val
        , this._obj
        , true
      );
    }
  }

  Assertion.addMethod('equal', assertEqual);
  Assertion.addMethod('equals', assertEqual);
  Assertion.addMethod('eq', assertEqual);

  /**
   * ### .eql(value)
   *
   * Asserts that the target is deeply equal to `value`.
   *
   *     expect({ foo: 'bar' }).to.eql({ foo: 'bar' });
   *     expect([ 1, 2, 3 ]).to.eql([ 1, 2, 3 ]);
   *
   * @name eql
   * @alias eqls
   * @param {Mixed} value
   * @param {String} message _optional_
   * @api public
   */

  function assertEql(obj, msg) {
    if (msg) flag(this, 'message', msg);
    this.assert(
        _.eql(obj, flag(this, 'object'))
      , 'expected #{this} to deeply equal #{exp}'
      , 'expected #{this} to not deeply equal #{exp}'
      , obj
      , this._obj
      , true
    );
  }

  Assertion.addMethod('eql', assertEql);
  Assertion.addMethod('eqls', assertEql);

  /**
   * ### .above(value)
   *
   * Asserts that the target is greater than `value`.
   *
   *     expect(10).to.be.above(5);
   *
   * Can also be used in conjunction with `length` to
   * assert a minimum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.above(2);
   *     expect([ 1, 2, 3 ]).to.have.length.above(2);
   *
   * @name above
   * @alias gt
   * @alias greaterThan
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertAbove (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len > n
        , 'expected #{this} to have a length above #{exp} but got #{act}'
        , 'expected #{this} to not have a length above #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj > n
        , 'expected #{this} to be above ' + n
        , 'expected #{this} to be at most ' + n
      );
    }
  }

  Assertion.addMethod('above', assertAbove);
  Assertion.addMethod('gt', assertAbove);
  Assertion.addMethod('greaterThan', assertAbove);

  /**
   * ### .least(value)
   *
   * Asserts that the target is greater than or equal to `value`.
   *
   *     expect(10).to.be.at.least(10);
   *
   * Can also be used in conjunction with `length` to
   * assert a minimum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.of.at.least(2);
   *     expect([ 1, 2, 3 ]).to.have.length.of.at.least(3);
   *
   * @name least
   * @alias gte
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertLeast (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len >= n
        , 'expected #{this} to have a length at least #{exp} but got #{act}'
        , 'expected #{this} to have a length below #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj >= n
        , 'expected #{this} to be at least ' + n
        , 'expected #{this} to be below ' + n
      );
    }
  }

  Assertion.addMethod('least', assertLeast);
  Assertion.addMethod('gte', assertLeast);

  /**
   * ### .below(value)
   *
   * Asserts that the target is less than `value`.
   *
   *     expect(5).to.be.below(10);
   *
   * Can also be used in conjunction with `length` to
   * assert a maximum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.below(4);
   *     expect([ 1, 2, 3 ]).to.have.length.below(4);
   *
   * @name below
   * @alias lt
   * @alias lessThan
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertBelow (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len < n
        , 'expected #{this} to have a length below #{exp} but got #{act}'
        , 'expected #{this} to not have a length below #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj < n
        , 'expected #{this} to be below ' + n
        , 'expected #{this} to be at least ' + n
      );
    }
  }

  Assertion.addMethod('below', assertBelow);
  Assertion.addMethod('lt', assertBelow);
  Assertion.addMethod('lessThan', assertBelow);

  /**
   * ### .most(value)
   *
   * Asserts that the target is less than or equal to `value`.
   *
   *     expect(5).to.be.at.most(5);
   *
   * Can also be used in conjunction with `length` to
   * assert a maximum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.of.at.most(4);
   *     expect([ 1, 2, 3 ]).to.have.length.of.at.most(3);
   *
   * @name most
   * @alias lte
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertMost (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len <= n
        , 'expected #{this} to have a length at most #{exp} but got #{act}'
        , 'expected #{this} to have a length above #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj <= n
        , 'expected #{this} to be at most ' + n
        , 'expected #{this} to be above ' + n
      );
    }
  }

  Assertion.addMethod('most', assertMost);
  Assertion.addMethod('lte', assertMost);

  /**
   * ### .within(start, finish)
   *
   * Asserts that the target is within a range.
   *
   *     expect(7).to.be.within(5,10);
   *
   * Can also be used in conjunction with `length` to
   * assert a length range. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.within(2,4);
   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);
   *
   * @name within
   * @param {Number} start lowerbound inclusive
   * @param {Number} finish upperbound inclusive
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('within', function (start, finish, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object')
      , range = start + '..' + finish;
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len >= start && len <= finish
        , 'expected #{this} to have a length within ' + range
        , 'expected #{this} to not have a length within ' + range
      );
    } else {
      this.assert(
          obj >= start && obj <= finish
        , 'expected #{this} to be within ' + range
        , 'expected #{this} to not be within ' + range
      );
    }
  });

  /**
   * ### .instanceof(constructor)
   *
   * Asserts that the target is an instance of `constructor`.
   *
   *     var Tea = function (name) { this.name = name; }
   *       , Chai = new Tea('chai');
   *
   *     expect(Chai).to.be.an.instanceof(Tea);
   *     expect([ 1, 2, 3 ]).to.be.instanceof(Array);
   *
   * @name instanceof
   * @param {Constructor} constructor
   * @param {String} message _optional_
   * @alias instanceOf
   * @api public
   */

  function assertInstanceOf (constructor, msg) {
    if (msg) flag(this, 'message', msg);
    var name = _.getName(constructor);
    this.assert(
        flag(this, 'object') instanceof constructor
      , 'expected #{this} to be an instance of ' + name
      , 'expected #{this} to not be an instance of ' + name
    );
  };

  Assertion.addMethod('instanceof', assertInstanceOf);
  Assertion.addMethod('instanceOf', assertInstanceOf);

  /**
   * ### .property(name, [value])
   *
   * Asserts that the target has a property `name`, optionally asserting that
   * the value of that property is strictly equal to  `value`.
   * If the `deep` flag is set, you can use dot- and bracket-notation for deep
   * references into objects and arrays.
   *
   *     // simple referencing
   *     var obj = { foo: 'bar' };
   *     expect(obj).to.have.property('foo');
   *     expect(obj).to.have.property('foo', 'bar');
   *
   *     // deep referencing
   *     var deepObj = {
   *         green: { tea: 'matcha' }
   *       , teas: [ 'chai', 'matcha', { tea: 'konacha' } ]
   *     };

   *     expect(deepObj).to.have.deep.property('green.tea', 'matcha');
   *     expect(deepObj).to.have.deep.property('teas[1]', 'matcha');
   *     expect(deepObj).to.have.deep.property('teas[2].tea', 'konacha');
   *
   * You can also use an array as the starting point of a `deep.property`
   * assertion, or traverse nested arrays.
   *
   *     var arr = [
   *         [ 'chai', 'matcha', 'konacha' ]
   *       , [ { tea: 'chai' }
   *         , { tea: 'matcha' }
   *         , { tea: 'konacha' } ]
   *     ];
   *
   *     expect(arr).to.have.deep.property('[0][1]', 'matcha');
   *     expect(arr).to.have.deep.property('[1][2].tea', 'konacha');
   *
   * Furthermore, `property` changes the subject of the assertion
   * to be the value of that property from the original object. This
   * permits for further chainable assertions on that property.
   *
   *     expect(obj).to.have.property('foo')
   *       .that.is.a('string');
   *     expect(deepObj).to.have.property('green')
   *       .that.is.an('object')
   *       .that.deep.equals({ tea: 'matcha' });
   *     expect(deepObj).to.have.property('teas')
   *       .that.is.an('array')
   *       .with.deep.property('[2]')
   *         .that.deep.equals({ tea: 'konacha' });
   *
   * @name property
   * @alias deep.property
   * @param {String} name
   * @param {Mixed} value (optional)
   * @param {String} message _optional_
   * @returns value of property for chaining
   * @api public
   */

  Assertion.addMethod('property', function (name, val, msg) {
    if (msg) flag(this, 'message', msg);

    var descriptor = flag(this, 'deep') ? 'deep property ' : 'property '
      , negate = flag(this, 'negate')
      , obj = flag(this, 'object')
      , value = flag(this, 'deep')
        ? _.getPathValue(name, obj)
        : obj[name];

    if (negate && undefined !== val) {
      if (undefined === value) {
        msg = (msg != null) ? msg + ': ' : '';
        throw new Error(msg + _.inspect(obj) + ' has no ' + descriptor + _.inspect(name));
      }
    } else {
      this.assert(
          undefined !== value
        , 'expected #{this} to have a ' + descriptor + _.inspect(name)
        , 'expected #{this} to not have ' + descriptor + _.inspect(name));
    }

    if (undefined !== val) {
      this.assert(
          val === value
        , 'expected #{this} to have a ' + descriptor + _.inspect(name) + ' of #{exp}, but got #{act}'
        , 'expected #{this} to not have a ' + descriptor + _.inspect(name) + ' of #{act}'
        , val
        , value
      );
    }

    flag(this, 'object', value);
  });


  /**
   * ### .ownProperty(name)
   *
   * Asserts that the target has an own property `name`.
   *
   *     expect('test').to.have.ownProperty('length');
   *
   * @name ownProperty
   * @alias haveOwnProperty
   * @param {String} name
   * @param {String} message _optional_
   * @api public
   */

  function assertOwnProperty (name, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    this.assert(
        obj.hasOwnProperty(name)
      , 'expected #{this} to have own property ' + _.inspect(name)
      , 'expected #{this} to not have own property ' + _.inspect(name)
    );
  }

  Assertion.addMethod('ownProperty', assertOwnProperty);
  Assertion.addMethod('haveOwnProperty', assertOwnProperty);

  /**
   * ### .length(value)
   *
   * Asserts that the target's `length` property has
   * the expected value.
   *
   *     expect([ 1, 2, 3]).to.have.length(3);
   *     expect('foobar').to.have.length(6);
   *
   * Can also be used as a chain precursor to a value
   * comparison for the length property.
   *
   *     expect('foo').to.have.length.above(2);
   *     expect([ 1, 2, 3 ]).to.have.length.above(2);
   *     expect('foo').to.have.length.below(4);
   *     expect([ 1, 2, 3 ]).to.have.length.below(4);
   *     expect('foo').to.have.length.within(2,4);
   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);
   *
   * @name length
   * @alias lengthOf
   * @param {Number} length
   * @param {String} message _optional_
   * @api public
   */

  function assertLengthChain () {
    flag(this, 'doLength', true);
  }

  function assertLength (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    new Assertion(obj, msg).to.have.property('length');
    var len = obj.length;

    this.assert(
        len == n
      , 'expected #{this} to have a length of #{exp} but got #{act}'
      , 'expected #{this} to not have a length of #{act}'
      , n
      , len
    );
  }

  Assertion.addChainableMethod('length', assertLength, assertLengthChain);
  Assertion.addMethod('lengthOf', assertLength, assertLengthChain);

  /**
   * ### .match(regexp)
   *
   * Asserts that the target matches a regular expression.
   *
   *     expect('foobar').to.match(/^foo/);
   *
   * @name match
   * @param {RegExp} RegularExpression
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('match', function (re, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    this.assert(
        re.exec(obj)
      , 'expected #{this} to match ' + re
      , 'expected #{this} not to match ' + re
    );
  });

  /**
   * ### .string(string)
   *
   * Asserts that the string target contains another string.
   *
   *     expect('foobar').to.have.string('bar');
   *
   * @name string
   * @param {String} string
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('string', function (str, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    new Assertion(obj, msg).is.a('string');

    this.assert(
        ~obj.indexOf(str)
      , 'expected #{this} to contain ' + _.inspect(str)
      , 'expected #{this} to not contain ' + _.inspect(str)
    );
  });


  /**
   * ### .keys(key1, [key2], [...])
   *
   * Asserts that the target has exactly the given keys, or
   * asserts the inclusion of some keys when using the
   * `include` or `contain` modifiers.
   *
   *     expect({ foo: 1, bar: 2 }).to.have.keys(['foo', 'bar']);
   *     expect({ foo: 1, bar: 2, baz: 3 }).to.contain.keys('foo', 'bar');
   *
   * @name keys
   * @alias key
   * @param {String...|Array} keys
   * @api public
   */

  function assertKeys (keys) {
    var obj = flag(this, 'object')
      , str
      , ok = true;

    keys = keys instanceof Array
      ? keys
      : Array.prototype.slice.call(arguments);

    if (!keys.length) throw new Error('keys required');

    var actual = Object.keys(obj)
      , len = keys.length;

    // Inclusion
    ok = keys.every(function(key){
      return ~actual.indexOf(key);
    });

    // Strict
    if (!flag(this, 'negate') && !flag(this, 'contains')) {
      ok = ok && keys.length == actual.length;
    }

    // Key string
    if (len > 1) {
      keys = keys.map(function(key){
        return _.inspect(key);
      });
      var last = keys.pop();
      str = keys.join(', ') + ', and ' + last;
    } else {
      str = _.inspect(keys[0]);
    }

    // Form
    str = (len > 1 ? 'keys ' : 'key ') + str;

    // Have / include
    str = (flag(this, 'contains') ? 'contain ' : 'have ') + str;

    // Assertion
    this.assert(
        ok
      , 'expected #{this} to ' + str
      , 'expected #{this} to not ' + str
    );
  }

  Assertion.addMethod('keys', assertKeys);
  Assertion.addMethod('key', assertKeys);

  /**
   * ### .throw(constructor)
   *
   * Asserts that the function target will throw a specific error, or specific type of error
   * (as determined using `instanceof`), optionally with a RegExp or string inclusion test
   * for the error's message.
   *
   *     var err = new ReferenceError('This is a bad function.');
   *     var fn = function () { throw err; }
   *     expect(fn).to.throw(ReferenceError);
   *     expect(fn).to.throw(Error);
   *     expect(fn).to.throw(/bad function/);
   *     expect(fn).to.not.throw('good function');
   *     expect(fn).to.throw(ReferenceError, /bad function/);
   *     expect(fn).to.throw(err);
   *     expect(fn).to.not.throw(new RangeError('Out of range.'));
   *
   * Please note that when a throw expectation is negated, it will check each
   * parameter independently, starting with error constructor type. The appropriate way
   * to check for the existence of a type of error but for a message that does not match
   * is to use `and`.
   *
   *     expect(fn).to.throw(ReferenceError)
   *        .and.not.throw(/good function/);
   *
   * @name throw
   * @alias throws
   * @alias Throw
   * @param {ErrorConstructor} constructor
   * @param {String|RegExp} expected error message
   * @param {String} message _optional_
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
   * @api public
   */

  function assertThrows (constructor, errMsg, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    new Assertion(obj, msg).is.a('function');

    var thrown = false
      , desiredError = null
      , name = null
      , thrownError = null;

    if (arguments.length === 0) {
      errMsg = null;
      constructor = null;
    } else if (constructor && (constructor instanceof RegExp || 'string' === typeof constructor)) {
      errMsg = constructor;
      constructor = null;
    } else if (constructor && constructor instanceof Error) {
      desiredError = constructor;
      constructor = null;
      errMsg = null;
    } else if (typeof constructor === 'function') {
      name = (new constructor()).name;
    } else {
      constructor = null;
    }

    try {
      obj();
    } catch (err) {
      // first, check desired error
      if (desiredError) {
        this.assert(
            err === desiredError
          , 'expected #{this} to throw #{exp} but #{act} was thrown'
          , 'expected #{this} to not throw #{exp}'
          , desiredError
          , err
        );

        return this;
      }
      // next, check constructor
      if (constructor) {
        this.assert(
            err instanceof constructor
          , 'expected #{this} to throw #{exp} but #{act} was thrown'
          , 'expected #{this} to not throw #{exp} but #{act} was thrown'
          , name
          , err
        );

        if (!errMsg) return this;
      }
      // next, check message
      var message = 'object' === _.type(err) && "message" in err
        ? err.message
        : '' + err;

      if ((message != null) && errMsg && errMsg instanceof RegExp) {
        this.assert(
            errMsg.exec(message)
          , 'expected #{this} to throw error matching #{exp} but got #{act}'
          , 'expected #{this} to throw error not matching #{exp}'
          , errMsg
          , message
        );

        return this;
      } else if ((message != null) && errMsg && 'string' === typeof errMsg) {
        this.assert(
            ~message.indexOf(errMsg)
          , 'expected #{this} to throw error including #{exp} but got #{act}'
          , 'expected #{this} to throw error not including #{act}'
          , errMsg
          , message
        );

        return this;
      } else {
        thrown = true;
        thrownError = err;
      }
    }

    var actuallyGot = ''
      , expectedThrown = name !== null
        ? name
        : desiredError
          ? '#{exp}' //_.inspect(desiredError)
          : 'an error';

    if (thrown) {
      actuallyGot = ' but #{act} was thrown'
    }

    this.assert(
        thrown === true
      , 'expected #{this} to throw ' + expectedThrown + actuallyGot
      , 'expected #{this} to not throw ' + expectedThrown + actuallyGot
      , desiredError
      , thrownError
    );
  };

  Assertion.addMethod('throw', assertThrows);
  Assertion.addMethod('throws', assertThrows);
  Assertion.addMethod('Throw', assertThrows);

  /**
   * ### .respondTo(method)
   *
   * Asserts that the object or class target will respond to a method.
   *
   *     Klass.prototype.bar = function(){};
   *     expect(Klass).to.respondTo('bar');
   *     expect(obj).to.respondTo('bar');
   *
   * To check if a constructor will respond to a static function,
   * set the `itself` flag.
   *
   *     Klass.baz = function(){};
   *     expect(Klass).itself.to.respondTo('baz');
   *
   * @name respondTo
   * @param {String} method
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('respondTo', function (method, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object')
      , itself = flag(this, 'itself')
      , context = ('function' === _.type(obj) && !itself)
        ? obj.prototype[method]
        : obj[method];

    this.assert(
        'function' === typeof context
      , 'expected #{this} to respond to ' + _.inspect(method)
      , 'expected #{this} to not respond to ' + _.inspect(method)
    );
  });

  /**
   * ### .itself
   *
   * Sets the `itself` flag, later used by the `respondTo` assertion.
   *
   *     function Foo() {}
   *     Foo.bar = function() {}
   *     Foo.prototype.baz = function() {}
   *
   *     expect(Foo).itself.to.respondTo('bar');
   *     expect(Foo).itself.not.to.respondTo('baz');
   *
   * @name itself
   * @api public
   */

  Assertion.addProperty('itself', function () {
    flag(this, 'itself', true);
  });

  /**
   * ### .satisfy(method)
   *
   * Asserts that the target passes a given truth test.
   *
   *     expect(1).to.satisfy(function(num) { return num > 0; });
   *
   * @name satisfy
   * @param {Function} matcher
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('satisfy', function (matcher, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    this.assert(
        matcher(obj)
      , 'expected #{this} to satisfy ' + _.objDisplay(matcher)
      , 'expected #{this} to not satisfy' + _.objDisplay(matcher)
      , this.negate ? false : true
      , matcher(obj)
    );
  });

  /**
   * ### .closeTo(expected, delta)
   *
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.
   *
   *     expect(1.5).to.be.closeTo(1, 0.5);
   *
   * @name closeTo
   * @param {Number} expected
   * @param {Number} delta
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('closeTo', function (expected, delta, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    this.assert(
        Math.abs(obj - expected) <= delta
      , 'expected #{this} to be close to ' + expected + ' +/- ' + delta
      , 'expected #{this} not to be close to ' + expected + ' +/- ' + delta
    );
  });

  function isSubsetOf(subset, superset) {
    return subset.every(function(elem) {
      return superset.indexOf(elem) !== -1;
    })
  }

  /**
   * ### .members(set)
   *
   * Asserts that the target is a superset of `set`,
   * or that the target and `set` have the same members.
   *
   *     expect([1, 2, 3]).to.include.members([3, 2]);
   *     expect([1, 2, 3]).to.not.include.members([3, 2, 8]);
   *
   *     expect([4, 2]).to.have.members([2, 4]);
   *     expect([5, 2]).to.not.have.members([5, 2, 1]);
   *
   * @name members
   * @param {Array} set
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('members', function (subset, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');

    new Assertion(obj).to.be.an('array');
    new Assertion(subset).to.be.an('array');

    if (flag(this, 'contains')) {
      return this.assert(
          isSubsetOf(subset, obj)
        , 'expected #{this} to be a superset of #{act}'
        , 'expected #{this} to not be a superset of #{act}'
        , obj
        , subset
      );
    }

    this.assert(
        isSubsetOf(obj, subset) && isSubsetOf(subset, obj)
        , 'expected #{this} to have the same members as #{act}'
        , 'expected #{this} to not have the same members as #{act}'
        , obj
        , subset
    );
  });
};

},{}],26:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */


module.exports = function (chai, util) {

  /*!
   * Chai dependencies.
   */

  var Assertion = chai.Assertion
    , flag = util.flag;

  /*!
   * Module export.
   */

  /**
   * ### assert(expression, message)
   *
   * Write your own test expressions.
   *
   *     assert('foo' !== 'bar', 'foo is not bar');
   *     assert(Array.isArray([]), 'empty arrays are arrays');
   *
   * @param {Mixed} expression to test for truthiness
   * @param {String} message to display on error
   * @name assert
   * @api public
   */

  var assert = chai.assert = function (express, errmsg) {
    var test = new Assertion(null);
    test.assert(
        express
      , errmsg
      , '[ negation message unavailable ]'
    );
  };

  /**
   * ### .fail(actual, expected, [message], [operator])
   *
   * Throw a failure. Node.js `assert` module-compatible.
   *
   * @name fail
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @param {String} operator
   * @api public
   */

  assert.fail = function (actual, expected, message, operator) {
    throw new chai.AssertionError({
        actual: actual
      , expected: expected
      , message: message
      , operator: operator
      , stackStartFunction: assert.fail
    });
  };

  /**
   * ### .ok(object, [message])
   *
   * Asserts that `object` is truthy.
   *
   *     assert.ok('everything', 'everything is ok');
   *     assert.ok(false, 'this will fail');
   *
   * @name ok
   * @param {Mixed} object to test
   * @param {String} message
   * @api public
   */

  assert.ok = function (val, msg) {
    new Assertion(val, msg).is.ok;
  };

  /**
   * ### .notOk(object, [message])
   *
   * Asserts that `object` is falsy.
   *
   *     assert.notOk('everything', 'this will fail');
   *     assert.notOk(false, 'this will pass');
   *
   * @name notOk
   * @param {Mixed} object to test
   * @param {String} message
   * @api public
   */

  assert.notOk = function (val, msg) {
    new Assertion(val, msg).is.not.ok;
  };

  /**
   * ### .equal(actual, expected, [message])
   *
   * Asserts non-strict equality (`==`) of `actual` and `expected`.
   *
   *     assert.equal(3, '3', '== coerces values to strings');
   *
   * @name equal
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.equal = function (act, exp, msg) {
    var test = new Assertion(act, msg);

    test.assert(
        exp == flag(test, 'object')
      , 'expected #{this} to equal #{exp}'
      , 'expected #{this} to not equal #{act}'
      , exp
      , act
    );
  };

  /**
   * ### .notEqual(actual, expected, [message])
   *
   * Asserts non-strict inequality (`!=`) of `actual` and `expected`.
   *
   *     assert.notEqual(3, 4, 'these numbers are not equal');
   *
   * @name notEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.notEqual = function (act, exp, msg) {
    var test = new Assertion(act, msg);

    test.assert(
        exp != flag(test, 'object')
      , 'expected #{this} to not equal #{exp}'
      , 'expected #{this} to equal #{act}'
      , exp
      , act
    );
  };

  /**
   * ### .strictEqual(actual, expected, [message])
   *
   * Asserts strict equality (`===`) of `actual` and `expected`.
   *
   *     assert.strictEqual(true, true, 'these booleans are strictly equal');
   *
   * @name strictEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.strictEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.equal(exp);
  };

  /**
   * ### .notStrictEqual(actual, expected, [message])
   *
   * Asserts strict inequality (`!==`) of `actual` and `expected`.
   *
   *     assert.notStrictEqual(3, '3', 'no coercion for strict equality');
   *
   * @name notStrictEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.notStrictEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.not.equal(exp);
  };

  /**
   * ### .deepEqual(actual, expected, [message])
   *
   * Asserts that `actual` is deeply equal to `expected`.
   *
   *     assert.deepEqual({ tea: 'green' }, { tea: 'green' });
   *
   * @name deepEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.deepEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.eql(exp);
  };

  /**
   * ### .notDeepEqual(actual, expected, [message])
   *
   * Assert that `actual` is not deeply equal to `expected`.
   *
   *     assert.notDeepEqual({ tea: 'green' }, { tea: 'jasmine' });
   *
   * @name notDeepEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.notDeepEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.not.eql(exp);
  };

  /**
   * ### .isTrue(value, [message])
   *
   * Asserts that `value` is true.
   *
   *     var teaServed = true;
   *     assert.isTrue(teaServed, 'the tea has been served');
   *
   * @name isTrue
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isTrue = function (val, msg) {
    new Assertion(val, msg).is['true'];
  };

  /**
   * ### .isFalse(value, [message])
   *
   * Asserts that `value` is false.
   *
   *     var teaServed = false;
   *     assert.isFalse(teaServed, 'no tea yet? hmm...');
   *
   * @name isFalse
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isFalse = function (val, msg) {
    new Assertion(val, msg).is['false'];
  };

  /**
   * ### .isNull(value, [message])
   *
   * Asserts that `value` is null.
   *
   *     assert.isNull(err, 'there was no error');
   *
   * @name isNull
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNull = function (val, msg) {
    new Assertion(val, msg).to.equal(null);
  };

  /**
   * ### .isNotNull(value, [message])
   *
   * Asserts that `value` is not null.
   *
   *     var tea = 'tasty chai';
   *     assert.isNotNull(tea, 'great, time for tea!');
   *
   * @name isNotNull
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotNull = function (val, msg) {
    new Assertion(val, msg).to.not.equal(null);
  };

  /**
   * ### .isUndefined(value, [message])
   *
   * Asserts that `value` is `undefined`.
   *
   *     var tea;
   *     assert.isUndefined(tea, 'no tea defined');
   *
   * @name isUndefined
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isUndefined = function (val, msg) {
    new Assertion(val, msg).to.equal(undefined);
  };

  /**
   * ### .isDefined(value, [message])
   *
   * Asserts that `value` is not `undefined`.
   *
   *     var tea = 'cup of chai';
   *     assert.isDefined(tea, 'tea has been defined');
   *
   * @name isDefined
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isDefined = function (val, msg) {
    new Assertion(val, msg).to.not.equal(undefined);
  };

  /**
   * ### .isFunction(value, [message])
   *
   * Asserts that `value` is a function.
   *
   *     function serveTea() { return 'cup of tea'; };
   *     assert.isFunction(serveTea, 'great, we can have tea now');
   *
   * @name isFunction
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isFunction = function (val, msg) {
    new Assertion(val, msg).to.be.a('function');
  };

  /**
   * ### .isNotFunction(value, [message])
   *
   * Asserts that `value` is _not_ a function.
   *
   *     var serveTea = [ 'heat', 'pour', 'sip' ];
   *     assert.isNotFunction(serveTea, 'great, we have listed the steps');
   *
   * @name isNotFunction
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotFunction = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('function');
  };

  /**
   * ### .isObject(value, [message])
   *
   * Asserts that `value` is an object (as revealed by
   * `Object.prototype.toString`).
   *
   *     var selection = { name: 'Chai', serve: 'with spices' };
   *     assert.isObject(selection, 'tea selection is an object');
   *
   * @name isObject
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isObject = function (val, msg) {
    new Assertion(val, msg).to.be.a('object');
  };

  /**
   * ### .isNotObject(value, [message])
   *
   * Asserts that `value` is _not_ an object.
   *
   *     var selection = 'chai'
   *     assert.isObject(selection, 'tea selection is not an object');
   *     assert.isObject(null, 'null is not an object');
   *
   * @name isNotObject
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotObject = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('object');
  };

  /**
   * ### .isArray(value, [message])
   *
   * Asserts that `value` is an array.
   *
   *     var menu = [ 'green', 'chai', 'oolong' ];
   *     assert.isArray(menu, 'what kind of tea do we want?');
   *
   * @name isArray
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isArray = function (val, msg) {
    new Assertion(val, msg).to.be.an('array');
  };

  /**
   * ### .isNotArray(value, [message])
   *
   * Asserts that `value` is _not_ an array.
   *
   *     var menu = 'green|chai|oolong';
   *     assert.isNotArray(menu, 'what kind of tea do we want?');
   *
   * @name isNotArray
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotArray = function (val, msg) {
    new Assertion(val, msg).to.not.be.an('array');
  };

  /**
   * ### .isString(value, [message])
   *
   * Asserts that `value` is a string.
   *
   *     var teaOrder = 'chai';
   *     assert.isString(teaOrder, 'order placed');
   *
   * @name isString
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isString = function (val, msg) {
    new Assertion(val, msg).to.be.a('string');
  };

  /**
   * ### .isNotString(value, [message])
   *
   * Asserts that `value` is _not_ a string.
   *
   *     var teaOrder = 4;
   *     assert.isNotString(teaOrder, 'order placed');
   *
   * @name isNotString
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotString = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('string');
  };

  /**
   * ### .isNumber(value, [message])
   *
   * Asserts that `value` is a number.
   *
   *     var cups = 2;
   *     assert.isNumber(cups, 'how many cups');
   *
   * @name isNumber
   * @param {Number} value
   * @param {String} message
   * @api public
   */

  assert.isNumber = function (val, msg) {
    new Assertion(val, msg).to.be.a('number');
  };

  /**
   * ### .isNotNumber(value, [message])
   *
   * Asserts that `value` is _not_ a number.
   *
   *     var cups = '2 cups please';
   *     assert.isNotNumber(cups, 'how many cups');
   *
   * @name isNotNumber
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotNumber = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('number');
  };

  /**
   * ### .isBoolean(value, [message])
   *
   * Asserts that `value` is a boolean.
   *
   *     var teaReady = true
   *       , teaServed = false;
   *
   *     assert.isBoolean(teaReady, 'is the tea ready');
   *     assert.isBoolean(teaServed, 'has tea been served');
   *
   * @name isBoolean
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isBoolean = function (val, msg) {
    new Assertion(val, msg).to.be.a('boolean');
  };

  /**
   * ### .isNotBoolean(value, [message])
   *
   * Asserts that `value` is _not_ a boolean.
   *
   *     var teaReady = 'yep'
   *       , teaServed = 'nope';
   *
   *     assert.isNotBoolean(teaReady, 'is the tea ready');
   *     assert.isNotBoolean(teaServed, 'has tea been served');
   *
   * @name isNotBoolean
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotBoolean = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('boolean');
  };

  /**
   * ### .typeOf(value, name, [message])
   *
   * Asserts that `value`'s type is `name`, as determined by
   * `Object.prototype.toString`.
   *
   *     assert.typeOf({ tea: 'chai' }, 'object', 'we have an object');
   *     assert.typeOf(['chai', 'jasmine'], 'array', 'we have an array');
   *     assert.typeOf('tea', 'string', 'we have a string');
   *     assert.typeOf(/tea/, 'regexp', 'we have a regular expression');
   *     assert.typeOf(null, 'null', 'we have a null');
   *     assert.typeOf(undefined, 'undefined', 'we have an undefined');
   *
   * @name typeOf
   * @param {Mixed} value
   * @param {String} name
   * @param {String} message
   * @api public
   */

  assert.typeOf = function (val, type, msg) {
    new Assertion(val, msg).to.be.a(type);
  };

  /**
   * ### .notTypeOf(value, name, [message])
   *
   * Asserts that `value`'s type is _not_ `name`, as determined by
   * `Object.prototype.toString`.
   *
   *     assert.notTypeOf('tea', 'number', 'strings are not numbers');
   *
   * @name notTypeOf
   * @param {Mixed} value
   * @param {String} typeof name
   * @param {String} message
   * @api public
   */

  assert.notTypeOf = function (val, type, msg) {
    new Assertion(val, msg).to.not.be.a(type);
  };

  /**
   * ### .instanceOf(object, constructor, [message])
   *
   * Asserts that `value` is an instance of `constructor`.
   *
   *     var Tea = function (name) { this.name = name; }
   *       , chai = new Tea('chai');
   *
   *     assert.instanceOf(chai, Tea, 'chai is an instance of tea');
   *
   * @name instanceOf
   * @param {Object} object
   * @param {Constructor} constructor
   * @param {String} message
   * @api public
   */

  assert.instanceOf = function (val, type, msg) {
    new Assertion(val, msg).to.be.instanceOf(type);
  };

  /**
   * ### .notInstanceOf(object, constructor, [message])
   *
   * Asserts `value` is not an instance of `constructor`.
   *
   *     var Tea = function (name) { this.name = name; }
   *       , chai = new String('chai');
   *
   *     assert.notInstanceOf(chai, Tea, 'chai is not an instance of tea');
   *
   * @name notInstanceOf
   * @param {Object} object
   * @param {Constructor} constructor
   * @param {String} message
   * @api public
   */

  assert.notInstanceOf = function (val, type, msg) {
    new Assertion(val, msg).to.not.be.instanceOf(type);
  };

  /**
   * ### .include(haystack, needle, [message])
   *
   * Asserts that `haystack` includes `needle`. Works
   * for strings and arrays.
   *
   *     assert.include('foobar', 'bar', 'foobar contains string "bar"');
   *     assert.include([ 1, 2, 3 ], 3, 'array contains value');
   *
   * @name include
   * @param {Array|String} haystack
   * @param {Mixed} needle
   * @param {String} message
   * @api public
   */

  assert.include = function (exp, inc, msg) {
    var obj = new Assertion(exp, msg);

    if (Array.isArray(exp)) {
      obj.to.include(inc);
    } else if ('string' === typeof exp) {
      obj.to.contain.string(inc);
    } else {
      throw new chai.AssertionError(
          'expected an array or string'
        , null
        , assert.include
      );
    }
  };

  /**
   * ### .notInclude(haystack, needle, [message])
   *
   * Asserts that `haystack` does not include `needle`. Works
   * for strings and arrays.
   *i
   *     assert.notInclude('foobar', 'baz', 'string not include substring');
   *     assert.notInclude([ 1, 2, 3 ], 4, 'array not include contain value');
   *
   * @name notInclude
   * @param {Array|String} haystack
   * @param {Mixed} needle
   * @param {String} message
   * @api public
   */

  assert.notInclude = function (exp, inc, msg) {
    var obj = new Assertion(exp, msg);

    if (Array.isArray(exp)) {
      obj.to.not.include(inc);
    } else if ('string' === typeof exp) {
      obj.to.not.contain.string(inc);
    } else {
      throw new chai.AssertionError(
          'expected an array or string'
        , null
        , assert.notInclude
      );
    }
  };

  /**
   * ### .match(value, regexp, [message])
   *
   * Asserts that `value` matches the regular expression `regexp`.
   *
   *     assert.match('foobar', /^foo/, 'regexp matches');
   *
   * @name match
   * @param {Mixed} value
   * @param {RegExp} regexp
   * @param {String} message
   * @api public
   */

  assert.match = function (exp, re, msg) {
    new Assertion(exp, msg).to.match(re);
  };

  /**
   * ### .notMatch(value, regexp, [message])
   *
   * Asserts that `value` does not match the regular expression `regexp`.
   *
   *     assert.notMatch('foobar', /^foo/, 'regexp does not match');
   *
   * @name notMatch
   * @param {Mixed} value
   * @param {RegExp} regexp
   * @param {String} message
   * @api public
   */

  assert.notMatch = function (exp, re, msg) {
    new Assertion(exp, msg).to.not.match(re);
  };

  /**
   * ### .property(object, property, [message])
   *
   * Asserts that `object` has a property named by `property`.
   *
   *     assert.property({ tea: { green: 'matcha' }}, 'tea');
   *
   * @name property
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.property = function (obj, prop, msg) {
    new Assertion(obj, msg).to.have.property(prop);
  };

  /**
   * ### .notProperty(object, property, [message])
   *
   * Asserts that `object` does _not_ have a property named by `property`.
   *
   *     assert.notProperty({ tea: { green: 'matcha' }}, 'coffee');
   *
   * @name notProperty
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.notProperty = function (obj, prop, msg) {
    new Assertion(obj, msg).to.not.have.property(prop);
  };

  /**
   * ### .deepProperty(object, property, [message])
   *
   * Asserts that `object` has a property named by `property`, which can be a
   * string using dot- and bracket-notation for deep reference.
   *
   *     assert.deepProperty({ tea: { green: 'matcha' }}, 'tea.green');
   *
   * @name deepProperty
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.deepProperty = function (obj, prop, msg) {
    new Assertion(obj, msg).to.have.deep.property(prop);
  };

  /**
   * ### .notDeepProperty(object, property, [message])
   *
   * Asserts that `object` does _not_ have a property named by `property`, which
   * can be a string using dot- and bracket-notation for deep reference.
   *
   *     assert.notDeepProperty({ tea: { green: 'matcha' }}, 'tea.oolong');
   *
   * @name notDeepProperty
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.notDeepProperty = function (obj, prop, msg) {
    new Assertion(obj, msg).to.not.have.deep.property(prop);
  };

  /**
   * ### .propertyVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property` with value given
   * by `value`.
   *
   *     assert.propertyVal({ tea: 'is good' }, 'tea', 'is good');
   *
   * @name propertyVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.propertyVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.have.property(prop, val);
  };

  /**
   * ### .propertyNotVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property`, but with a value
   * different from that given by `value`.
   *
   *     assert.propertyNotVal({ tea: 'is good' }, 'tea', 'is bad');
   *
   * @name propertyNotVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.propertyNotVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.not.have.property(prop, val);
  };

  /**
   * ### .deepPropertyVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property` with value given
   * by `value`. `property` can use dot- and bracket-notation for deep
   * reference.
   *
   *     assert.deepPropertyVal({ tea: { green: 'matcha' }}, 'tea.green', 'matcha');
   *
   * @name deepPropertyVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.deepPropertyVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.have.deep.property(prop, val);
  };

  /**
   * ### .deepPropertyNotVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property`, but with a value
   * different from that given by `value`. `property` can use dot- and
   * bracket-notation for deep reference.
   *
   *     assert.deepPropertyNotVal({ tea: { green: 'matcha' }}, 'tea.green', 'konacha');
   *
   * @name deepPropertyNotVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.deepPropertyNotVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.not.have.deep.property(prop, val);
  };

  /**
   * ### .lengthOf(object, length, [message])
   *
   * Asserts that `object` has a `length` property with the expected value.
   *
   *     assert.lengthOf([1,2,3], 3, 'array has length of 3');
   *     assert.lengthOf('foobar', 5, 'string has length of 6');
   *
   * @name lengthOf
   * @param {Mixed} object
   * @param {Number} length
   * @param {String} message
   * @api public
   */

  assert.lengthOf = function (exp, len, msg) {
    new Assertion(exp, msg).to.have.length(len);
  };

  /**
   * ### .throws(function, [constructor/string/regexp], [string/regexp], [message])
   *
   * Asserts that `function` will throw an error that is an instance of
   * `constructor`, or alternately that it will throw an error with message
   * matching `regexp`.
   *
   *     assert.throw(fn, 'function throws a reference error');
   *     assert.throw(fn, /function throws a reference error/);
   *     assert.throw(fn, ReferenceError);
   *     assert.throw(fn, ReferenceError, 'function throws a reference error');
   *     assert.throw(fn, ReferenceError, /function throws a reference error/);
   *
   * @name throws
   * @alias throw
   * @alias Throw
   * @param {Function} function
   * @param {ErrorConstructor} constructor
   * @param {RegExp} regexp
   * @param {String} message
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
   * @api public
   */

  assert.Throw = function (fn, errt, errs, msg) {
    if ('string' === typeof errt || errt instanceof RegExp) {
      errs = errt;
      errt = null;
    }

    new Assertion(fn, msg).to.Throw(errt, errs);
  };

  /**
   * ### .doesNotThrow(function, [constructor/regexp], [message])
   *
   * Asserts that `function` will _not_ throw an error that is an instance of
   * `constructor`, or alternately that it will not throw an error with message
   * matching `regexp`.
   *
   *     assert.doesNotThrow(fn, Error, 'function does not throw');
   *
   * @name doesNotThrow
   * @param {Function} function
   * @param {ErrorConstructor} constructor
   * @param {RegExp} regexp
   * @param {String} message
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
   * @api public
   */

  assert.doesNotThrow = function (fn, type, msg) {
    if ('string' === typeof type) {
      msg = type;
      type = null;
    }

    new Assertion(fn, msg).to.not.Throw(type);
  };

  /**
   * ### .operator(val1, operator, val2, [message])
   *
   * Compares two values using `operator`.
   *
   *     assert.operator(1, '<', 2, 'everything is ok');
   *     assert.operator(1, '>', 2, 'this will fail');
   *
   * @name operator
   * @param {Mixed} val1
   * @param {String} operator
   * @param {Mixed} val2
   * @param {String} message
   * @api public
   */

  assert.operator = function (val, operator, val2, msg) {
    if (!~['==', '===', '>', '>=', '<', '<=', '!=', '!=='].indexOf(operator)) {
      throw new Error('Invalid operator "' + operator + '"');
    }
    var test = new Assertion(eval(val + operator + val2), msg);
    test.assert(
        true === flag(test, 'object')
      , 'expected ' + util.inspect(val) + ' to be ' + operator + ' ' + util.inspect(val2)
      , 'expected ' + util.inspect(val) + ' to not be ' + operator + ' ' + util.inspect(val2) );
  };

  /**
   * ### .closeTo(actual, expected, delta, [message])
   *
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.
   *
   *     assert.closeTo(1.5, 1, 0.5, 'numbers are close');
   *
   * @name closeTo
   * @param {Number} actual
   * @param {Number} expected
   * @param {Number} delta
   * @param {String} message
   * @api public
   */

  assert.closeTo = function (act, exp, delta, msg) {
    new Assertion(act, msg).to.be.closeTo(exp, delta);
  };

  /**
   * ### .sameMembers(set1, set2, [message])
   *
   * Asserts that `set1` and `set2` have the same members.
   * Order is not taken into account.
   *
   *     assert.sameMembers([ 1, 2, 3 ], [ 2, 1, 3 ], 'same members');
   *
   * @name sameMembers
   * @param {Array} superset
   * @param {Array} subset
   * @param {String} message
   * @api public
   */

  assert.sameMembers = function (set1, set2, msg) {
    new Assertion(set1, msg).to.have.same.members(set2);
  }

  /**
   * ### .includeMembers(superset, subset, [message])
   *
   * Asserts that `subset` is included in `superset`.
   * Order is not taken into account.
   *
   *     assert.includeMembers([ 1, 2, 3 ], [ 2, 1 ], 'include members');
   *
   * @name includeMembers
   * @param {Array} superset
   * @param {Array} subset
   * @param {String} message
   * @api public
   */

  assert.includeMembers = function (superset, subset, msg) {
    new Assertion(superset, msg).to.include.members(subset);
  }

  /*!
   * Undocumented / untested
   */

  assert.ifError = function (val, msg) {
    new Assertion(val, msg).to.not.be.ok;
  };

  /*!
   * Aliases.
   */

  (function alias(name, as){
    assert[as] = assert[name];
    return alias;
  })
  ('Throw', 'throw')
  ('Throw', 'throws');
};

},{}],27:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai, util) {
  chai.expect = function (val, message) {
    return new chai.Assertion(val, message);
  };
};


},{}],28:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai, util) {
  var Assertion = chai.Assertion;

  function loadShould () {
    // modify Object.prototype to have `should`
    Object.defineProperty(Object.prototype, 'should',
      {
        set: function (value) {
          // See https://github.com/chaijs/chai/issues/86: this makes
          // `whatever.should = someValue` actually set `someValue`, which is
          // especially useful for `global.should = require('chai').should()`.
          //
          // Note that we have to use [[DefineProperty]] instead of [[Put]]
          // since otherwise we would trigger this very setter!
          Object.defineProperty(this, 'should', {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
          });
        }
      , get: function(){
          if (this instanceof String || this instanceof Number) {
            return new Assertion(this.constructor(this));
          } else if (this instanceof Boolean) {
            return new Assertion(this == true);
          }
          return new Assertion(this);
        }
      , configurable: true
    });

    var should = {};

    should.equal = function (val1, val2, msg) {
      new Assertion(val1, msg).to.equal(val2);
    };

    should.Throw = function (fn, errt, errs, msg) {
      new Assertion(fn, msg).to.Throw(errt, errs);
    };

    should.exist = function (val, msg) {
      new Assertion(val, msg).to.exist;
    }

    // negation
    should.not = {}

    should.not.equal = function (val1, val2, msg) {
      new Assertion(val1, msg).to.not.equal(val2);
    };

    should.not.Throw = function (fn, errt, errs, msg) {
      new Assertion(fn, msg).to.not.Throw(errt, errs);
    };

    should.not.exist = function (val, msg) {
      new Assertion(val, msg).to.not.exist;
    }

    should['throw'] = should['Throw'];
    should.not['throw'] = should.not['Throw'];

    return should;
  };

  chai.should = loadShould;
  chai.Should = loadShould;
};

},{}],29:[function(require,module,exports){
/*!
 * Chai - addChainingMethod utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var transferFlags = require('./transferFlags');

/*!
 * Module variables
 */

// Check whether `__proto__` is supported
var hasProtoSupport = '__proto__' in Object;

// Without `__proto__` support, this module will need to add properties to a function.
// However, some Function.prototype methods cannot be overwritten,
// and there seems no easy cross-platform way to detect them (@see chaijs/chai/issues/69).
var excludeNames = /^(?:length|name|arguments|caller)$/;

// Cache `Function` properties
var call  = Function.prototype.call,
    apply = Function.prototype.apply;

/**
 * ### addChainableMethod (ctx, name, method, chainingBehavior)
 *
 * Adds a method to an object, such that the method can also be chained.
 *
 *     utils.addChainableMethod(chai.Assertion.prototype, 'foo', function (str) {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.equal(str);
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.addChainableMethod('foo', fn, chainingBehavior);
 *
 * The result can then be used as both a method assertion, executing both `method` and
 * `chainingBehavior`, or as a language chain, which only executes `chainingBehavior`.
 *
 *     expect(fooStr).to.be.foo('bar');
 *     expect(fooStr).to.be.foo.equal('foo');
 *
 * @param {Object} ctx object to which the method is added
 * @param {String} name of method to add
 * @param {Function} method function to be used for `name`, when called
 * @param {Function} chainingBehavior function to be called every time the property is accessed
 * @name addChainableMethod
 * @api public
 */

module.exports = function (ctx, name, method, chainingBehavior) {
  if (typeof chainingBehavior !== 'function')
    chainingBehavior = function () { };

  Object.defineProperty(ctx, name,
    { get: function () {
        chainingBehavior.call(this);

        var assert = function () {
          var result = method.apply(this, arguments);
          return result === undefined ? this : result;
        };

        // Use `__proto__` if available
        if (hasProtoSupport) {
          // Inherit all properties from the object by replacing the `Function` prototype
          var prototype = assert.__proto__ = Object.create(this);
          // Restore the `call` and `apply` methods from `Function`
          prototype.call = call;
          prototype.apply = apply;
        }
        // Otherwise, redefine all properties (slow!)
        else {
          var asserterNames = Object.getOwnPropertyNames(ctx);
          asserterNames.forEach(function (asserterName) {
            if (!excludeNames.test(asserterName)) {
              var pd = Object.getOwnPropertyDescriptor(ctx, asserterName);
              Object.defineProperty(assert, asserterName, pd);
            }
          });
        }

        transferFlags(this, assert);
        return assert;
      }
    , configurable: true
  });
};

},{"./transferFlags":45}],30:[function(require,module,exports){
/*!
 * Chai - addMethod utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### .addMethod (ctx, name, method)
 *
 * Adds a method to the prototype of an object.
 *
 *     utils.addMethod(chai.Assertion.prototype, 'foo', function (str) {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.equal(str);
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.addMethod('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(fooStr).to.be.foo('bar');
 *
 * @param {Object} ctx object to which the method is added
 * @param {String} name of method to add
 * @param {Function} method function to be used for name
 * @name addMethod
 * @api public
 */

module.exports = function (ctx, name, method) {
  ctx[name] = function () {
    var result = method.apply(this, arguments);
    return result === undefined ? this : result;
  };
};

},{}],31:[function(require,module,exports){
/*!
 * Chai - addProperty utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### addProperty (ctx, name, getter)
 *
 * Adds a property to the prototype of an object.
 *
 *     utils.addProperty(chai.Assertion.prototype, 'foo', function () {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.instanceof(Foo);
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.addProperty('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.be.foo;
 *
 * @param {Object} ctx object to which the property is added
 * @param {String} name of property to add
 * @param {Function} getter function to be used for name
 * @name addProperty
 * @api public
 */

module.exports = function (ctx, name, getter) {
  Object.defineProperty(ctx, name,
    { get: function () {
        var result = getter.call(this);
        return result === undefined ? this : result;
      }
    , configurable: true
  });
};

},{}],32:[function(require,module,exports){
/*!
 * Chai - flag utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### flag(object ,key, [value])
 *
 * Get or set a flag value on an object. If a
 * value is provided it will be set, else it will
 * return the currently set value or `undefined` if
 * the value is not set.
 *
 *     utils.flag(this, 'foo', 'bar'); // setter
 *     utils.flag(this, 'foo'); // getter, returns `bar`
 *
 * @param {Object} object (constructed Assertion
 * @param {String} key
 * @param {Mixed} value (optional)
 * @name flag
 * @api private
 */

module.exports = function (obj, key, value) {
  var flags = obj.__flags || (obj.__flags = Object.create(null));
  if (arguments.length === 3) {
    flags[key] = value;
  } else {
    return flags[key];
  }
};

},{}],33:[function(require,module,exports){
/*!
 * Chai - getActual utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * # getActual(object, [actual])
 *
 * Returns the `actual` value for an Assertion
 *
 * @param {Object} object (constructed Assertion)
 * @param {Arguments} chai.Assertion.prototype.assert arguments
 */

module.exports = function (obj, args) {
  var actual = args[4];
  return 'undefined' !== typeof actual ? actual : obj._obj;
};

},{}],34:[function(require,module,exports){
/*!
 * Chai - getEnumerableProperties utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### .getEnumerableProperties(object)
 *
 * This allows the retrieval of enumerable property names of an object,
 * inherited or not.
 *
 * @param {Object} object
 * @returns {Array}
 * @name getEnumerableProperties
 * @api public
 */

module.exports = function getEnumerableProperties(object) {
  var result = [];
  for (var name in object) {
    result.push(name);
  }
  return result;
};

},{}],35:[function(require,module,exports){
/*!
 * Chai - message composition utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var flag = require('./flag')
  , getActual = require('./getActual')
  , inspect = require('./inspect')
  , objDisplay = require('./objDisplay');

/**
 * ### .getMessage(object, message, negateMessage)
 *
 * Construct the error message based on flags
 * and template tags. Template tags will return
 * a stringified inspection of the object referenced.
 *
 * Message template tags:
 * - `#{this}` current asserted object
 * - `#{act}` actual value
 * - `#{exp}` expected value
 *
 * @param {Object} object (constructed Assertion)
 * @param {Arguments} chai.Assertion.prototype.assert arguments
 * @name getMessage
 * @api public
 */

module.exports = function (obj, args) {
  var negate = flag(obj, 'negate')
    , val = flag(obj, 'object')
    , expected = args[3]
    , actual = getActual(obj, args)
    , msg = negate ? args[2] : args[1]
    , flagMsg = flag(obj, 'message');

  msg = msg || '';
  msg = msg
    .replace(/#{this}/g, objDisplay(val))
    .replace(/#{act}/g, objDisplay(actual))
    .replace(/#{exp}/g, objDisplay(expected));

  return flagMsg ? flagMsg + ': ' + msg : msg;
};

},{"./flag":32,"./getActual":33,"./inspect":40,"./objDisplay":41}],36:[function(require,module,exports){
/*!
 * Chai - getName utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * # getName(func)
 *
 * Gets the name of a function, in a cross-browser way.
 *
 * @param {Function} a function (usually a constructor)
 */

module.exports = function (func) {
  if (func.name) return func.name;

  var match = /^\s?function ([^(]*)\(/.exec(func);
  return match && match[1] ? match[1] : "";
};

},{}],37:[function(require,module,exports){
/*!
 * Chai - getPathValue utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * @see https://github.com/logicalparadox/filtr
 * MIT Licensed
 */

/**
 * ### .getPathValue(path, object)
 *
 * This allows the retrieval of values in an
 * object given a string path.
 *
 *     var obj = {
 *         prop1: {
 *             arr: ['a', 'b', 'c']
 *           , str: 'Hello'
 *         }
 *       , prop2: {
 *             arr: [ { nested: 'Universe' } ]
 *           , str: 'Hello again!'
 *         }
 *     }
 *
 * The following would be the results.
 *
 *     getPathValue('prop1.str', obj); // Hello
 *     getPathValue('prop1.att[2]', obj); // b
 *     getPathValue('prop2.arr[0].nested', obj); // Universe
 *
 * @param {String} path
 * @param {Object} object
 * @returns {Object} value or `undefined`
 * @name getPathValue
 * @api public
 */

var getPathValue = module.exports = function (path, obj) {
  var parsed = parsePath(path);
  return _getPathValue(parsed, obj);
};

/*!
 * ## parsePath(path)
 *
 * Helper function used to parse string object
 * paths. Use in conjunction with `_getPathValue`.
 *
 *      var parsed = parsePath('myobject.property.subprop');
 *
 * ### Paths:
 *
 * * Can be as near infinitely deep and nested
 * * Arrays are also valid using the formal `myobject.document[3].property`.
 *
 * @param {String} path
 * @returns {Object} parsed
 * @api private
 */

function parsePath (path) {
  var str = path.replace(/\[/g, '.[')
    , parts = str.match(/(\\\.|[^.]+?)+/g);
  return parts.map(function (value) {
    var re = /\[(\d+)\]$/
      , mArr = re.exec(value)
    if (mArr) return { i: parseFloat(mArr[1]) };
    else return { p: value };
  });
};

/*!
 * ## _getPathValue(parsed, obj)
 *
 * Helper companion function for `.parsePath` that returns
 * the value located at the parsed address.
 *
 *      var value = getPathValue(parsed, obj);
 *
 * @param {Object} parsed definition from `parsePath`.
 * @param {Object} object to search against
 * @returns {Object|Undefined} value
 * @api private
 */

function _getPathValue (parsed, obj) {
  var tmp = obj
    , res;
  for (var i = 0, l = parsed.length; i < l; i++) {
    var part = parsed[i];
    if (tmp) {
      if ('undefined' !== typeof part.p)
        tmp = tmp[part.p];
      else if ('undefined' !== typeof part.i)
        tmp = tmp[part.i];
      if (i == (l - 1)) res = tmp;
    } else {
      res = undefined;
    }
  }
  return res;
};

},{}],38:[function(require,module,exports){
/*!
 * Chai - getProperties utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### .getProperties(object)
 *
 * This allows the retrieval of property names of an object, enumerable or not,
 * inherited or not.
 *
 * @param {Object} object
 * @returns {Array}
 * @name getProperties
 * @api public
 */

module.exports = function getProperties(object) {
  var result = Object.getOwnPropertyNames(subject);

  function addProperty(property) {
    if (result.indexOf(property) === -1) {
      result.push(property);
    }
  }

  var proto = Object.getPrototypeOf(subject);
  while (proto !== null) {
    Object.getOwnPropertyNames(proto).forEach(addProperty);
    proto = Object.getPrototypeOf(proto);
  }

  return result;
};

},{}],39:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Main exports
 */

var exports = module.exports = {};

/*!
 * test utility
 */

exports.test = require('./test');

/*!
 * type utility
 */

exports.type = require('./type');

/*!
 * message utility
 */

exports.getMessage = require('./getMessage');

/*!
 * actual utility
 */

exports.getActual = require('./getActual');

/*!
 * Inspect util
 */

exports.inspect = require('./inspect');

/*!
 * Object Display util
 */

exports.objDisplay = require('./objDisplay');

/*!
 * Flag utility
 */

exports.flag = require('./flag');

/*!
 * Flag transferring utility
 */

exports.transferFlags = require('./transferFlags');

/*!
 * Deep equal utility
 */

exports.eql = require('deep-eql');

/*!
 * Deep path value
 */

exports.getPathValue = require('./getPathValue');

/*!
 * Function name
 */

exports.getName = require('./getName');

/*!
 * add Property
 */

exports.addProperty = require('./addProperty');

/*!
 * add Method
 */

exports.addMethod = require('./addMethod');

/*!
 * overwrite Property
 */

exports.overwriteProperty = require('./overwriteProperty');

/*!
 * overwrite Method
 */

exports.overwriteMethod = require('./overwriteMethod');

/*!
 * Add a chainable method
 */

exports.addChainableMethod = require('./addChainableMethod');


},{"./addChainableMethod":29,"./addMethod":30,"./addProperty":31,"./flag":32,"./getActual":33,"./getMessage":35,"./getName":36,"./getPathValue":37,"./inspect":40,"./objDisplay":41,"./overwriteMethod":42,"./overwriteProperty":43,"./test":44,"./transferFlags":45,"./type":46,"deep-eql":48}],40:[function(require,module,exports){
// This is (almost) directly from Node.js utils
// https://github.com/joyent/node/blob/f8c335d0caf47f16d31413f89aa28eda3878e3aa/lib/util.js

var getName = require('./getName');
var getProperties = require('./getProperties');
var getEnumerableProperties = require('./getEnumerableProperties');

module.exports = inspect;

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Boolean} showHidden Flag that shows hidden (not enumerable)
 *    properties of objects.
 * @param {Number} depth Depth in which to descend in object. Default is 2.
 * @param {Boolean} colors Flag to turn on ANSI escape codes to color the
 *    output. Default is false (no coloring).
 */
function inspect(obj, showHidden, depth, colors) {
  var ctx = {
    showHidden: showHidden,
    seen: [],
    stylize: function (str) { return str; }
  };
  return formatValue(ctx, obj, (typeof depth === 'undefined' ? 2 : depth));
}

// https://gist.github.com/1044128/
var getOuterHTML = function(element) {
  if ('outerHTML' in element) return element.outerHTML;
  var ns = "http://www.w3.org/1999/xhtml";
  var container = document.createElementNS(ns, '_');
  var elemProto = (window.HTMLElement || window.Element).prototype;
  var xmlSerializer = new XMLSerializer();
  var html;
  if (document.xmlVersion) {
    return xmlSerializer.serializeToString(element);
  } else {
    container.appendChild(element.cloneNode(false));
    html = container.innerHTML.replace('><', '>' + element.innerHTML + '<');
    container.innerHTML = '';
    return html;
  }
};

// Returns true if object is a DOM element.
var isDOMElement = function (object) {
  if (typeof HTMLElement === 'object') {
    return object instanceof HTMLElement;
  } else {
    return object &&
      typeof object === 'object' &&
      object.nodeType === 1 &&
      typeof object.nodeName === 'string';
  }
};

function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (value && typeof value.inspect === 'function' &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes);
    if (typeof ret !== 'string') {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // If it's DOM elem, get outer HTML.
  if (isDOMElement(value)) {
    return getOuterHTML(value);
  }

  // Look up the keys of the object.
  var visibleKeys = getEnumerableProperties(value);
  var keys = ctx.showHidden ? getProperties(value) : visibleKeys;

  // Some type of object without properties can be shortcutted.
  // In IE, errors have a single `stack` property, or if they are vanilla `Error`,
  // a `stack` plus `description` property; ignore those for consistency.
  if (keys.length === 0 || (isError(value) && (
      (keys.length === 1 && keys[0] === 'stack') ||
      (keys.length === 2 && keys[0] === 'description' && keys[1] === 'stack')
     ))) {
    if (typeof value === 'function') {
      var name = getName(value);
      var nameSuffix = name ? ': ' + name : '';
      return ctx.stylize('[Function' + nameSuffix + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toUTCString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (typeof value === 'function') {
    var name = getName(value);
    var nameSuffix = name ? ': ' + name : '';
    base = ' [Function' + nameSuffix + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    return formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  switch (typeof value) {
    case 'undefined':
      return ctx.stylize('undefined', 'undefined');

    case 'string':
      var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                               .replace(/'/g, "\\'")
                                               .replace(/\\"/g, '"') + '\'';
      return ctx.stylize(simple, 'string');

    case 'number':
      return ctx.stylize('' + value, 'number');

    case 'boolean':
      return ctx.stylize('' + value, 'boolean');
  }
  // For some reason typeof null is "object", so special case here.
  if (value === null) {
    return ctx.stylize('null', 'null');
  }
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (Object.prototype.hasOwnProperty.call(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str;
  if (value.__lookupGetter__) {
    if (value.__lookupGetter__(key)) {
      if (value.__lookupSetter__(key)) {
        str = ctx.stylize('[Getter/Setter]', 'special');
      } else {
        str = ctx.stylize('[Getter]', 'special');
      }
    } else {
      if (value.__lookupSetter__(key)) {
        str = ctx.stylize('[Setter]', 'special');
      }
    }
  }
  if (visibleKeys.indexOf(key) < 0) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(value[key]) < 0) {
      if (recurseTimes === null) {
        str = formatValue(ctx, value[key], null);
      } else {
        str = formatValue(ctx, value[key], recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (typeof name === 'undefined') {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}

function isArray(ar) {
  return Array.isArray(ar) ||
         (typeof ar === 'object' && objectToString(ar) === '[object Array]');
}

function isRegExp(re) {
  return typeof re === 'object' && objectToString(re) === '[object RegExp]';
}

function isDate(d) {
  return typeof d === 'object' && objectToString(d) === '[object Date]';
}

function isError(e) {
  return typeof e === 'object' && objectToString(e) === '[object Error]';
}

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

},{"./getEnumerableProperties":34,"./getName":36,"./getProperties":38}],41:[function(require,module,exports){
/*!
 * Chai - flag utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var inspect = require('./inspect');

/**
 * ### .objDisplay (object)
 *
 * Determines if an object or an array matches
 * criteria to be inspected in-line for error
 * messages or should be truncated.
 *
 * @param {Mixed} javascript object to inspect
 * @name objDisplay
 * @api public
 */

module.exports = function (obj) {
  var str = inspect(obj)
    , type = Object.prototype.toString.call(obj);

  if (str.length >= 40) {
    if (type === '[object Function]') {
      return !obj.name || obj.name === ''
        ? '[Function]'
        : '[Function: ' + obj.name + ']';
    } else if (type === '[object Array]') {
      return '[ Array(' + obj.length + ') ]';
    } else if (type === '[object Object]') {
      var keys = Object.keys(obj)
        , kstr = keys.length > 2
          ? keys.splice(0, 2).join(', ') + ', ...'
          : keys.join(', ');
      return '{ Object (' + kstr + ') }';
    } else {
      return str;
    }
  } else {
    return str;
  }
};

},{"./inspect":40}],42:[function(require,module,exports){
/*!
 * Chai - overwriteMethod utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### overwriteMethod (ctx, name, fn)
 *
 * Overwites an already existing method and provides
 * access to previous function. Must return function
 * to be used for name.
 *
 *     utils.overwriteMethod(chai.Assertion.prototype, 'equal', function (_super) {
 *       return function (str) {
 *         var obj = utils.flag(this, 'object');
 *         if (obj instanceof Foo) {
 *           new chai.Assertion(obj.value).to.equal(str);
 *         } else {
 *           _super.apply(this, arguments);
 *         }
 *       }
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.overwriteMethod('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.equal('bar');
 *
 * @param {Object} ctx object whose method is to be overwritten
 * @param {String} name of method to overwrite
 * @param {Function} method function that returns a function to be used for name
 * @name overwriteMethod
 * @api public
 */

module.exports = function (ctx, name, method) {
  var _method = ctx[name]
    , _super = function () { return this; };

  if (_method && 'function' === typeof _method)
    _super = _method;

  ctx[name] = function () {
    var result = method(_super).apply(this, arguments);
    return result === undefined ? this : result;
  }
};

},{}],43:[function(require,module,exports){
/*!
 * Chai - overwriteProperty utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### overwriteProperty (ctx, name, fn)
 *
 * Overwites an already existing property getter and provides
 * access to previous value. Must return function to use as getter.
 *
 *     utils.overwriteProperty(chai.Assertion.prototype, 'ok', function (_super) {
 *       return function () {
 *         var obj = utils.flag(this, 'object');
 *         if (obj instanceof Foo) {
 *           new chai.Assertion(obj.name).to.equal('bar');
 *         } else {
 *           _super.call(this);
 *         }
 *       }
 *     });
 *
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.overwriteProperty('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.be.ok;
 *
 * @param {Object} ctx object whose property is to be overwritten
 * @param {String} name of property to overwrite
 * @param {Function} getter function that returns a getter function to be used for name
 * @name overwriteProperty
 * @api public
 */

module.exports = function (ctx, name, getter) {
  var _get = Object.getOwnPropertyDescriptor(ctx, name)
    , _super = function () {};

  if (_get && 'function' === typeof _get.get)
    _super = _get.get

  Object.defineProperty(ctx, name,
    { get: function () {
        var result = getter(_super).call(this);
        return result === undefined ? this : result;
      }
    , configurable: true
  });
};

},{}],44:[function(require,module,exports){
/*!
 * Chai - test utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var flag = require('./flag');

/**
 * # test(object, expression)
 *
 * Test and object for expression.
 *
 * @param {Object} object (constructed Assertion)
 * @param {Arguments} chai.Assertion.prototype.assert arguments
 */

module.exports = function (obj, args) {
  var negate = flag(obj, 'negate')
    , expr = args[0];
  return negate ? !expr : expr;
};

},{"./flag":32}],45:[function(require,module,exports){
/*!
 * Chai - transferFlags utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### transferFlags(assertion, object, includeAll = true)
 *
 * Transfer all the flags for `assertion` to `object`. If
 * `includeAll` is set to `false`, then the base Chai
 * assertion flags (namely `object`, `ssfi`, and `message`)
 * will not be transferred.
 *
 *
 *     var newAssertion = new Assertion();
 *     utils.transferFlags(assertion, newAssertion);
 *
 *     var anotherAsseriton = new Assertion(myObj);
 *     utils.transferFlags(assertion, anotherAssertion, false);
 *
 * @param {Assertion} assertion the assertion to transfer the flags from
 * @param {Object} object the object to transfer the flags too; usually a new assertion
 * @param {Boolean} includeAll
 * @name getAllFlags
 * @api private
 */

module.exports = function (assertion, object, includeAll) {
  var flags = assertion.__flags || (assertion.__flags = Object.create(null));

  if (!object.__flags) {
    object.__flags = Object.create(null);
  }

  includeAll = arguments.length === 3 ? includeAll : true;

  for (var flag in flags) {
    if (includeAll ||
        (flag !== 'object' && flag !== 'ssfi' && flag != 'message')) {
      object.__flags[flag] = flags[flag];
    }
  }
};

},{}],46:[function(require,module,exports){
/*!
 * Chai - type utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Detectable javascript natives
 */

var natives = {
    '[object Arguments]': 'arguments'
  , '[object Array]': 'array'
  , '[object Date]': 'date'
  , '[object Function]': 'function'
  , '[object Number]': 'number'
  , '[object RegExp]': 'regexp'
  , '[object String]': 'string'
};

/**
 * ### type(object)
 *
 * Better implementation of `typeof` detection that can
 * be used cross-browser. Handles the inconsistencies of
 * Array, `null`, and `undefined` detection.
 *
 *     utils.type({}) // 'object'
 *     utils.type(null) // `null'
 *     utils.type(undefined) // `undefined`
 *     utils.type([]) // `array`
 *
 * @param {Mixed} object to detect type of
 * @name type
 * @api private
 */

module.exports = function (obj) {
  var str = Object.prototype.toString.call(obj);
  if (natives[str]) return natives[str];
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (obj === Object(obj)) return 'object';
  return typeof obj;
};

},{}],47:[function(require,module,exports){
/*!
 * assertion-error
 * Copyright(c) 2013 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Return a function that will copy properties from
 * one object to another excluding any originally
 * listed. Returned function will create a new `{}`.
 *
 * @param {String} excluded properties ...
 * @return {Function}
 */

function exclude () {
  var excludes = [].slice.call(arguments);

  function excludeProps (res, obj) {
    Object.keys(obj).forEach(function (key) {
      if (!~excludes.indexOf(key)) res[key] = obj[key];
    });
  }

  return function extendExclude () {
    var args = [].slice.call(arguments)
      , i = 0
      , res = {};

    for (; i < args.length; i++) {
      excludeProps(res, args[i]);
    }

    return res;
  };
};

/*!
 * Primary Exports
 */

module.exports = AssertionError;

/**
 * ### AssertionError
 *
 * An extension of the JavaScript `Error` constructor for
 * assertion and validation scenarios.
 *
 * @param {String} message
 * @param {Object} properties to include (optional)
 * @param {callee} start stack function (optional)
 */

function AssertionError (message, _props, ssf) {
  var extend = exclude('name', 'message', 'stack', 'constructor', 'toJSON')
    , props = extend(_props || {});

  // default values
  this.message = message || 'Unspecified AssertionError';
  this.showDiff = false;

  // copy from properties
  for (var key in props) {
    this[key] = props[key];
  }

  // capture stack trace
  ssf = ssf || arguments.callee;
  if (ssf && Error.captureStackTrace) {
    Error.captureStackTrace(this, ssf);
  }
}

/*!
 * Inherit from Error.prototype
 */

AssertionError.prototype = Object.create(Error.prototype);

/*!
 * Statically set name
 */

AssertionError.prototype.name = 'AssertionError';

/*!
 * Ensure correct constructor
 */

AssertionError.prototype.constructor = AssertionError;

/**
 * Allow errors to be converted to JSON for static transfer.
 *
 * @param {Boolean} include stack (default: `true`)
 * @return {Object} object that can be `JSON.stringify`
 */

AssertionError.prototype.toJSON = function (stack) {
  var extend = exclude('constructor', 'toJSON', 'stack')
    , props = extend({ name: this.name }, this);

  // include stack if exists and not turned off
  if (false !== stack && this.stack) {
    props.stack = this.stack;
  }

  return props;
};

},{}],48:[function(require,module,exports){
module.exports = require('./lib/eql');

},{"./lib/eql":49}],49:[function(require,module,exports){
/*!
 * deep-eql
 * Copyright(c) 2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var type = require('type-detect');

/*!
 * Buffer.isBuffer browser shim
 */

var Buffer;
try { Buffer = require('buffer').Buffer; }
catch(ex) {
  Buffer = {};
  Buffer.isBuffer = function() { return false; }
}

/*!
 * Primary Export
 */

module.exports = deepEqual;

/**
 * Assert super-strict (egal) equality between
 * two objects of any type.
 *
 * @param {Mixed} a
 * @param {Mixed} b
 * @param {Array} memoised (optional)
 * @return {Boolean} equal match
 */

function deepEqual(a, b, m) {
  if (sameValue(a, b)) {
    return true;
  } else if ('date' === type(a)) {
    return dateEqual(a, b);
  } else if ('regexp' === type(a)) {
    return regexpEqual(a, b);
  } else if (Buffer.isBuffer(a)) {
    return bufferEqual(a, b);
  } else if ('arguments' === type(a)) {
    return argumentsEqual(a, b, m);
  } else if (!typeEqual(a, b)) {
    return false;
  } else if (('object' !== type(a) && 'object' !== type(b))
  && ('array' !== type(a) && 'array' !== type(b))) {
    return sameValue(a, b);
  } else {
    return objectEqual(a, b, m);
  }
}

/*!
 * Strict (egal) equality test. Ensures that NaN always
 * equals NaN and `-0` does not equal `+0`.
 *
 * @param {Mixed} a
 * @param {Mixed} b
 * @return {Boolean} equal match
 */

function sameValue(a, b) {
  if (a === b) return a !== 0 || 1 / a === 1 / b;
  return a !== a && b !== b;
}

/*!
 * Compare the types of two given objects and
 * return if they are equal. Note that an Array
 * has a type of `array` (not `object`) and arguments
 * have a type of `arguments` (not `array`/`object`).
 *
 * @param {Mixed} a
 * @param {Mixed} b
 * @return {Boolean} result
 */

function typeEqual(a, b) {
  return type(a) === type(b);
}

/*!
 * Compare two Date objects by asserting that
 * the time values are equal using `saveValue`.
 *
 * @param {Date} a
 * @param {Date} b
 * @return {Boolean} result
 */

function dateEqual(a, b) {
  if ('date' !== type(b)) return false;
  return sameValue(a.getTime(), b.getTime());
}

/*!
 * Compare two regular expressions by converting them
 * to string and checking for `sameValue`.
 *
 * @param {RegExp} a
 * @param {RegExp} b
 * @return {Boolean} result
 */

function regexpEqual(a, b) {
  if ('regexp' !== type(b)) return false;
  return sameValue(a.toString(), b.toString());
}

/*!
 * Assert deep equality of two `arguments` objects.
 * Unfortunately, these must be sliced to arrays
 * prior to test to ensure no bad behavior.
 *
 * @param {Arguments} a
 * @param {Arguments} b
 * @param {Array} memoize (optional)
 * @return {Boolean} result
 */

function argumentsEqual(a, b, m) {
  if ('arguments' !== type(b)) return false;
  a = [].slice.call(a);
  b = [].slice.call(b);
  return deepEqual(a, b, m);
}

/*!
 * Get enumerable properties of a given object.
 *
 * @param {Object} a
 * @return {Array} property names
 */

function enumerable(a) {
  var res = [];
  for (var key in a) res.push(key);
  return res;
}

/*!
 * Simple equality for flat iterable objects
 * such as Arrays or Node.js buffers.
 *
 * @param {Iterable} a
 * @param {Iterable} b
 * @return {Boolean} result
 */

function iterableEqual(a, b) {
  if (a.length !==  b.length) return false;

  var i = 0;
  var match = true;

  for (; i < a.length; i++) {
    if (a[i] !== b[i]) {
      match = false;
      break;
    }
  }

  return match;
}

/*!
 * Extension to `iterableEqual` specifically
 * for Node.js Buffers.
 *
 * @param {Buffer} a
 * @param {Mixed} b
 * @return {Boolean} result
 */

function bufferEqual(a, b) {
  if (!Buffer.isBuffer(b)) return false;
  return iterableEqual(a, b);
}

/*!
 * Block for `objectEqual` ensuring non-existing
 * values don't get in.
 *
 * @param {Mixed} object
 * @return {Boolean} result
 */

function isValue(a) {
  return a !== null && a !== undefined;
}

/*!
 * Recursively check the equality of two objects.
 * Once basic sameness has been established it will
 * defer to `deepEqual` for each enumerable key
 * in the object.
 *
 * @param {Mixed} a
 * @param {Mixed} b
 * @return {Boolean} result
 */

function objectEqual(a, b, m) {
  if (!isValue(a) || !isValue(b)) {
    return false;
  }

  if (a.prototype !== b.prototype) {
    return false;
  }

  var i;
  if (m) {
    for (i = 0; i < m.length; i++) {
      if ((m[i][0] === a && m[i][1] === b)
      ||  (m[i][0] === b && m[i][1] === a)) {
        return true;
      }
    }
  } else {
    m = [];
  }

  try {
    var ka = enumerable(a);
    var kb = enumerable(b);
  } catch (ex) {
    return false;
  }

  ka.sort();
  kb.sort();

  if (!iterableEqual(ka, kb)) {
    return false;
  }

  m.push([ a, b ]);

  var key;
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], m)) {
      return false;
    }
  }

  return true;
}

},{"buffer":20,"type-detect":50}],50:[function(require,module,exports){
module.exports = require('./lib/type');

},{"./lib/type":51}],51:[function(require,module,exports){
/*!
 * type-detect
 * Copyright(c) 2013 jake luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Primary Exports
 */

var exports = module.exports = getType;

/*!
 * Detectable javascript natives
 */

var natives = {
    '[object Array]': 'array'
  , '[object RegExp]': 'regexp'
  , '[object Function]': 'function'
  , '[object Arguments]': 'arguments'
  , '[object Date]': 'date'
};

/**
 * ### typeOf (obj)
 *
 * Use several different techniques to determine
 * the type of object being tested.
 *
 *
 * @param {Mixed} object
 * @return {String} object type
 * @api public
 */

function getType (obj) {
  var str = Object.prototype.toString.call(obj);
  if (natives[str]) return natives[str];
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (obj === Object(obj)) return 'object';
  return typeof obj;
}

exports.Library = Library;

/**
 * ### Library
 *
 * Create a repository for custom type detection.
 *
 * ```js
 * var lib = new type.Library;
 * ```
 *
 */

function Library () {
  this.tests = {};
}

/**
 * #### .of (obj)
 *
 * Expose replacement `typeof` detection to the library.
 *
 * ```js
 * if ('string' === lib.of('hello world')) {
 *   // ...
 * }
 * ```
 *
 * @param {Mixed} object to test
 * @return {String} type
 */

Library.prototype.of = getType;

/**
 * #### .define (type, test)
 *
 * Add a test to for the `.test()` assertion.
 *
 * Can be defined as a regular expression:
 *
 * ```js
 * lib.define('int', /^[0-9]+$/);
 * ```
 *
 * ... or as a function:
 *
 * ```js
 * lib.define('bln', function (obj) {
 *   if ('boolean' === lib.of(obj)) return true;
 *   var blns = [ 'yes', 'no', 'true', 'false', 1, 0 ];
 *   if ('string' === lib.of(obj)) obj = obj.toLowerCase();
 *   return !! ~blns.indexOf(obj);
 * });
 * ```
 *
 * @param {String} type
 * @param {RegExp|Function} test
 * @api public
 */

Library.prototype.define = function (type, test) {
  if (arguments.length === 1) return this.tests[type];
  this.tests[type] = test;
  return this;
};

/**
 * #### .test (obj, test)
 *
 * Assert that an object is of type. Will first
 * check natives, and if that does not pass it will
 * use the user defined custom tests.
 *
 * ```js
 * assert(lib.test('1', 'int'));
 * assert(lib.test('yes', 'bln'));
 * ```
 *
 * @param {Mixed} object
 * @param {String} type
 * @return {Boolean} result
 * @api public
 */

Library.prototype.test = function (obj, type) {
  if (type === getType(obj)) return true;
  var test = this.tests[type];

  if (test && 'regexp' === getType(test)) {
    return test.test(obj);
  } else if (test && 'function' === getType(test)) {
    return test(obj);
  } else {
    throw new ReferenceError('Type test "' + type + '" not defined or invalid.');
  }
};

},{}],52:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
(function() {
  var assert, deepEqual, equal, eve, fail, notDeepEqual, notEqual, notStrictEqual, ok, strictEqual, type, _ref;

  _ref = require("./helper"), assert = _ref.assert, ok = _ref.ok, fail = _ref.fail, equal = _ref.equal, notEqual = _ref.notEqual, deepEqual = _ref.deepEqual, notDeepEqual = _ref.notDeepEqual, strictEqual = _ref.strictEqual, notStrictEqual = _ref.notStrictEqual, eve = _ref.eve;

  type = eve.type;

  describe("type", function() {
    return describe("and", function() {
      beforeEach(function() {
        return this.schema = type.and([type.string().lowercase().notEmpty().len(3, 12), type.string().trim().notEmpty().email()]);
      });
      it("should have and type", function() {
        return ok(type.and);
      });
      it("should process values", function() {
        var val;
        val = this.schema.val(" Test@g.com ").val();
        equal(val, "test@g.com");
        return ok(!this.schema.validate());
      });
      it("should validate required if required and embedded in object", function() {
        var errs, sc;
        sc = type.object({
          test: type.and([type.string().len(5), type.string().email()]).required()
        });
        errs = sc.val({
          test2: ["a"]
        }).validate(function(errs) {
          ok(errs);
          return equal(errs.messages().length, 1);
        });
        ok(errs);
        return equal(errs.messages().length, 1);
      });
      it("should not validate required if not required and embedded in object", function() {
        var errs, sc;
        sc = type.object({
          test: type.and([type.string().len(5), type.string().email()])
        });
        errs = sc.val({
          test2: ["a"]
        }).validate(function(errs) {
          return ok(!errs);
        });
        return ok(!errs);
      });
      it("should process values for clones", function() {
        var sc, val;
        sc = this.schema.clone();
        val = sc.val(" Test@g.com ").val();
        equal(val, "test@g.com");
        return ok(!sc.validate());
      });
      it("should be able to validate if both fails", function(done) {
        var errs;
        this.schema.val("");
        errs = this.schema.validate(function(errs) {
          ok(errs);
          equal(errs.messages().length, 2);
          return done();
        });
        return ok(errs);
      });
      it("should be able to validate if both fails for clones", function(done) {
        var errs, sc;
        sc = this.schema.clone();
        sc.val("");
        errs = sc.validate(function(errs) {
          ok(errs);
          equal(errs.messages().length, 2);
          return done();
        });
        return ok(errs);
      });
      it("should be able to validate if one is valid", function(done) {
        var errs;
        this.schema.val("test");
        errs = this.schema.validate(function(errs) {
          ok(errs);
          equal(errs.messages().length, 1);
          return done();
        });
        return ok(errs);
      });
      it("should be able to validate if one is valid for clones", function(done) {
        var errs, sc;
        sc = this.schema.clone();
        sc.val("test");
        errs = sc.validate(function(errs) {
          ok(errs);
          equal(errs.messages().length, 1);
          return done();
        });
        return ok(errs);
      });
      it("should be able to validate if both are valid", function(done) {
        var errs;
        this.schema.val("ddddt@g.com");
        return errs = this.schema.validate(function(errs) {
          ok(!errs);
          return done();
        });
      });
      it("should be able to validate if both are valid for clones", function(done) {
        var errs, sc;
        sc = this.schema.clone();
        sc.val("ddddt@g.com");
        return errs = sc.validate(function(errs) {
          ok(!errs);
          return done();
        });
      });
      it("should be able to validate async", function(done) {
        var sc;
        sc = type.and([
          type.string().validator(function(val, next) {
            return setTimeout((function() {
              return next(val !== "admin");
            }), 100);
          }, "must not be admin"), type.string().trim().email().validator(function(val, next) {
            return setTimeout((function() {
              return next(val.length !== 5);
            }), 100);
          }, "must not have 5 chars")
        ]);
        return sc.val("admin").validate(function(errs) {
          ok(errs);
          equal(errs.messages().length, 3);
          return done();
        });
      });
      return it("should support custom validators", function() {
        var sc;
        sc = type.and([
          type.string().validator(function(val) {
            ok(this);
            equal(val, "admin");
            return true;
          })
        ]);
        return sc.val("admin").validate();
      });
    });
  });

}).call(this);

},{"./helper":58}],53:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
(function() {
  var assert, deepEqual, equal, eve, fail, notDeepEqual, notEqual, notStrictEqual, ok, strictEqual, _ref;

  _ref = require("./helper"), assert = _ref.assert, ok = _ref.ok, fail = _ref.fail, equal = _ref.equal, notEqual = _ref.notEqual, deepEqual = _ref.deepEqual, notDeepEqual = _ref.notDeepEqual, strictEqual = _ref.strictEqual, notStrictEqual = _ref.notStrictEqual, eve = _ref.eve;

  describe("type", function() {
    var type;
    type = eve.type;
    return describe("array", function() {
      it("should have array type", function() {
        return ok(type.array);
      });
      it("should be able to convert type", function() {
        return deepEqual(type.array().val([1, 2, 3]).val(), [1, 2, 3]);
      });
      it("should be able to validate length", function() {
        var err;
        err = type.array().len(5).val([1, 2, 3]).validate();
        ok(err);
        equal(err.messages().length, 1);
        err = type.array().len(4, 5).val([1, 2, 3]).validate();
        ok(err);
        return equal(err.messages().length, 1);
      });
      it("should have item schema", function() {
        var errs, schema;
        schema = type.array(type.number().max(2)).len(5).val([1, "2", 3]);
        deepEqual(schema.val(), [1, 2, 3]);
        errs = schema.validate(function(errs) {
          return equal(errs.messages().length, 2);
        });
        return equal(errs.messages().length, 2);
      });
      it("should validate required if required and embedded in object", function() {
        var errs, schema;
        schema = type.object({
          test: type.array(type.number().required()).required()
        }).required();
        errs = schema.val({
          test2: ["a"]
        }).validate(function(errs) {
          ok(errs);
          return equal(errs.messages().length, 1);
        });
        ok(errs);
        return equal(errs.messages().length, 1);
      });
      it("should be an array if embedded in object", function() {
        var errs, schema;
        schema = type.object({
          test: type.array().required()
        }).required();
        errs = schema.val({
          test: 3
        }).validate(function(errs) {
          ok(errs);
          return equal(errs.messages().length, 1);
        });
        ok(errs);
        return equal(errs.messages().length, 1);
      });
      it("should be an array", function() {
        var errs, schema;
        schema = type.array();
        errs = schema.val({}).validate(function(errs) {
          ok(errs);
          return equal(errs.messages().length, 1);
        });
        ok(errs);
        equal(errs.messages().length, 1);
        errs = schema.val(2).validate(function(errs) {
          ok(errs);
          return equal(errs.messages().length, 1);
        });
        ok(errs);
        return equal(errs.messages().length, 1);
      });
      it("should cast string to an array", function() {
        var errs, schema;
        schema = type.array();
        errs = schema.val("").validate(function(errs) {
          return ok(!errs);
        });
        ok(!errs);
        equal(schema.val('').val()[0], '');
        return equal(schema.val('1,2,3').val()[2], '3');
      });
      it("should raise if empty", function() {
        var errs, schema;
        schema = type.object({
          test: type.array(type.number().required()).notEmpty()
        }).required();
        errs = schema.val({
          test: []
        }).validate(function(errs) {
          ok(errs);
          return equal(errs.messages().length, 1);
        });
        ok(errs);
        return equal(errs.messages().length, 1);
      });
      it("should raise if no array", function() {
        var errs, schema;
        schema = type.object({
          test: type.array(type.number().required()).notEmpty()
        }).required();
        errs = schema.val({
          test: "a test"
        }).validate(function(errs) {
          ok(errs);
          return equal(errs.messages().length, 1);
        });
        ok(errs);
        return equal(errs.messages().length, 1);
      });
      it("should validate inner object", function() {
        var errs, schema;
        schema = type.array(type.object({
          login: type.string().required()
        })).val([
          {
            nologin: true
          }, {
            login: true
          }, {
            nologin: true
          }
        ]);
        errs = schema.validate(function(errs) {
          ok(errs);
          return equal(errs.messages().length, 3);
        });
        ok(errs);
        return equal(errs.messages().length, 3);
      });
      it("should have item schema of clone", function() {
        var errs, schema;
        schema = type.array(type.number().max(2)).len(5).clone().val([1, "2", 3]);
        deepEqual(schema.val(), [1, 2, 3]);
        errs = schema.validate(function(errs) {
          return equal(errs.messages().length, 2);
        });
        return equal(errs.messages().length, 2);
      });
      return it("should be able to recognize type alias", function() {
        var data;
        data = type.array({
          login: String
        }).val([
          {
            login: "123"
          }
        ]).val();
        return strictEqual(data[0].login, "123");
      });
    });
  });

}).call(this);

},{"./helper":58}],54:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
(function() {
  var assert, deepEqual, equal, eve, fail, notDeepEqual, notEqual, notStrictEqual, ok, strictEqual, _ref;

  _ref = require("./helper"), assert = _ref.assert, ok = _ref.ok, fail = _ref.fail, equal = _ref.equal, notEqual = _ref.notEqual, deepEqual = _ref.deepEqual, notDeepEqual = _ref.notDeepEqual, strictEqual = _ref.strictEqual, notStrictEqual = _ref.notStrictEqual, eve = _ref.eve;

  describe("type", function() {
    var type;
    type = eve.type;
    return describe("bool", function() {
      it("should have bool type", function() {
        return ok(type.bool);
      });
      it("should convert type", function() {
        strictEqual(type.bool().val(" true ").val(), true);
        strictEqual(type.bool().val(" Tr_ue").val(), " Tr_ue");
        return strictEqual(type.bool().val("fAlse ").val(), false);
      });
      it("should validate", function() {
        ok(type.bool().val("test").validate());
        ok(!type.bool().val(true).validate());
        ok(!type.bool().val(false).validate());
        ok(!type.bool().val("false").validate());
        return ok(!type.bool().val("true").validate());
      });
      it("should pass not required bools", function() {
        ok(!type.bool().val(undefined).validate());
        return ok(!type.bool().val(null).validate());
      });
      return it("should raise on required bools", function() {
        ok(type.bool().required().val(undefined).validate());
        return ok(type.bool().required().val(null).validate());
      });
    });
  });

}).call(this);

},{"./helper":58}],55:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
(function() {
  var assert, deepEqual, equal, eve, fail, notDeepEqual, notEqual, notStrictEqual, ok, strictEqual, _ref;

  _ref = require("./helper"), assert = _ref.assert, ok = _ref.ok, fail = _ref.fail, equal = _ref.equal, notEqual = _ref.notEqual, deepEqual = _ref.deepEqual, notDeepEqual = _ref.notDeepEqual, strictEqual = _ref.strictEqual, notStrictEqual = _ref.notStrictEqual, eve = _ref.eve;

  describe("error", function() {
    var error;
    error = eve.error;
    it("should have error object", function() {
      return ok(error);
    });
    it("should push message", function() {
      var err, msgs;
      err = new error();
      equal(err.ok, false);
      err.alias("Name");
      err.push("is invalid");
      err.push("is not empty");
      equal(err.ok, true);
      msgs = err.messages(true);
      ok(msgs);
      equal(msgs.length, 2);
      equal(msgs[0], "is invalid");
      msgs = err.messages();
      equal(msgs[0], "Name is invalid");
      return equal(err.message.match(/Name/g).length, 2);
    });
    it("should push error object", function() {
      var err, err1, err2, msgs;
      err = new error();
      err.alias("Name");
      err.push("is invalid");
      err1 = new error();
      err1.alias("Password");
      err1.push("is invalid");
      err2 = new error();
      err2.on("name", err);
      err2.on("password", err1);
      msgs = err2.messages(true);
      ok(msgs);
      equal(msgs.length, 2);
      equal(msgs[0], "is invalid");
      msgs = err2.messages();
      equal(msgs[0], "Name is invalid");
      msgs = err2.on("name").messages();
      equal(msgs.length, 1);
      equal(msgs[0], "Name is invalid");
      ok(err2.message.match(/Name/));
      return ok(err2.message.match(/Password/));
    });
    return it("should work with Error", function() {
      var err;
      err = new error();
      err.alias("Name");
      err.push("is invalid");
      err.push("is not empty");
      return ok(err instanceof Error);
    });
  });

}).call(this);

},{"./helper":58}],56:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
(function() {
  var assert, deepEqual, equal, eve, fail, notDeepEqual, notEqual, notStrictEqual, ok, strictEqual, _ref;

  _ref = require("./helper"), assert = _ref.assert, ok = _ref.ok, fail = _ref.fail, equal = _ref.equal, notEqual = _ref.notEqual, deepEqual = _ref.deepEqual, notDeepEqual = _ref.notDeepEqual, strictEqual = _ref.strictEqual, notStrictEqual = _ref.notStrictEqual, eve = _ref.eve;

  describe("examples", function() {
    return describe("signup_user", function() {
      var schema, type, user;
      type = eve.type;
      user = {
        login: "test",
        name: "Test",
        email: "test@mail.com",
        password: "test",
        password_confirmation: "test",
        birthday: "1990-1-1",
        age: "20"
      };
      schema = type.object({
        login: type.string().lowercase().trim().notEmpty().len(3, 12).match(/^[a-zA-Z0-9]*$/).validator(function(val, done) {
          return setTimeout((function() {
            return done(val !== "admin");
          }), 100);
        }, "must be unique"),
        name: type.string().trim().notEmpty(),
        email: type.string().trim().notEmpty().email(),
        password: type.string().trim().notEmpty().len(6, 12),
        password_confirmation: type.string().trim().notEmpty().len(6, 12).validator(function(val) {
          return val === this.password;
        }, "must be equal to password"),
        birthday: type.date(),
        age: type.integer()
      });
      return schema.value(user).validate(function(errors) {});
    });
  });

}).call(this);

},{"./helper":58}],57:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
(function() {
  var assert, deepEqual, equal, eve, fail, message, notDeepEqual, notEqual, notStrictEqual, ok, strictEqual, type, validator, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require("./helper"), assert = _ref.assert, ok = _ref.ok, fail = _ref.fail, equal = _ref.equal, notEqual = _ref.notEqual, deepEqual = _ref.deepEqual, notDeepEqual = _ref.notDeepEqual, strictEqual = _ref.strictEqual, notStrictEqual = _ref.notStrictEqual, eve = _ref.eve;

  type = eve.type;

  message = eve.message;

  validator = eve.validator;

  validator.isGood = function(str) {
    return this.isString(str) && str === 'good';
  };

  type.string.prototype.good = function(msg) {
    this._good = true;
    this.validator((function(str) {
      return str && validator.isGood(str);
    }), message("good", msg));
    return this;
  };

  type._my = (function(_super) {
    __extends(_my, _super);

    function _my() {
      _my.__super__.constructor.call(this);
      this.validator(function(val) {
        return val === 'myval';
      }, message("invalid"));
    }

    return _my;

  })(type.Base);

  type.register('my', type._my);

  describe("extend", function() {
    describe("my type", function() {
      it("should have my type", function() {
        return ok(type.my);
      });
      it("should validate", function() {
        ok(type.my().required().value("other").validate());
        return ok(!type.my().required().value("myval").validate());
      });
      it("should check exist and empty", function() {
        ok(type.my().required().value(null).validate());
        ok(!type.my().required().value("myval").validate());
        ok(!type.my().notEmpty().value(null).validate());
        return ok(type.my().notEmpty().value(" ").validate());
      });
      it("should return in callback", function(done) {
        return type.my().required().value(null).validate(function(err) {
          ok(err);
          return done();
        });
      });
      it("should skip validator when empty", function(done) {
        return type.my().validator(function(val) {
          return val === 10;
        }).value(null).validate(function(err) {
          ok(!err);
          return done();
        });
      });
      it("should set default value", function() {
        equal(type.my()["default"]("myval").value(null).value(), "myval");
        return equal(type.my()["default"]("myval").value(void 0).value(), "myval");
      });
      return it("should can add a processor", function() {
        var schema;
        schema = type.my().processor(function(val) {
          return val + "-modified";
        });
        return equal(schema.value("myval").value(), "myval-modified");
      });
    });
    return describe("good string", function() {
      return it("should validate", function() {
        ok(type.string().good().required().value("other").validate());
        return ok(!type.string().good().required().value("good").validate());
      });
    });
  });

}).call(this);

},{"./helper":58}],58:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
(function() {
  var exporter, exports;

  if ((typeof window) !== 'undefined') {
    exporter = window.chai.assert;
  } else {
    exporter = require("chai").assert;
  }

  exporter.eve = require("./../lib/eve.js");

  exports = module.exports = exporter;

}).call(this);

},{"./../lib/eve.js":7,"chai":22}],59:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
(function() {
  var assert, deepEqual, equal, eve, fail, notDeepEqual, notEqual, notStrictEqual, ok, strictEqual, _ref;

  _ref = require("./helper"), assert = _ref.assert, ok = _ref.ok, fail = _ref.fail, equal = _ref.equal, notEqual = _ref.notEqual, deepEqual = _ref.deepEqual, notDeepEqual = _ref.notDeepEqual, strictEqual = _ref.strictEqual, notStrictEqual = _ref.notStrictEqual, eve = _ref.eve;

  if ((typeof window) !== 'undefined') {
    require('./../lib/message-zh-CN.js');
  }

  describe("message", function() {
    var message;
    message = eve.message;
    it("should have message", function() {
      return ok(message);
    });
    it("should be able to set/get locale", function() {
      message.locale("en-US");
      equal(message.locale(), "en-US");
      message.locale("zh-CN");
      ok(message.dictionary["zh-CN"]);
      return ok(message.dictionary["zh-CN"]["invalid"]);
    });
    it("should be able to store message", function() {
      message.store("test", {
        invalid: "invalid"
      });
      message.locale("test");
      return equal(message("invalid"), "invalid");
    });
    it("should support default message", function() {
      return equal(message("invalid", "default message"), "default message");
    });
    return it("should replace options", function() {
      message.store("test", {
        invalid: "invalid {{msg}}"
      });
      message.locale("test");
      return equal(message("invalid", null, {
        msg: "test"
      }), "invalid test");
    });
  });

}).call(this);

},{"./../lib/message-zh-CN.js":8,"./helper":58}],60:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
(function() {
  var assert, deepEqual, equal, eve, fail, notDeepEqual, notEqual, notStrictEqual, ok, strictEqual, _ref;

  _ref = require("./helper"), assert = _ref.assert, ok = _ref.ok, fail = _ref.fail, equal = _ref.equal, notEqual = _ref.notEqual, deepEqual = _ref.deepEqual, notDeepEqual = _ref.notDeepEqual, strictEqual = _ref.strictEqual, notStrictEqual = _ref.notStrictEqual, eve = _ref.eve;

  describe("type", function() {
    var type;
    type = eve.type;
    describe("number", function() {
      it("should have number type", function() {
        return ok(type.number);
      });
      it("should convert type", function() {
        strictEqual(type.number().val("23dd").val(), "23dd");
        strictEqual(type.number().val("23.11").val(), 23.11);
        return strictEqual(type.number().val(23.11).val(), 23.11);
      });
      it("should be able to compare", function() {
        ok(!type.number().min(10).max(30).val(23.11).validate());
        ok(type.number().min(10).max(30).val(9).validate());
        return ok(type.number().min(10).max(30).val(40).validate());
      });
      return it("should not accept empty numbers", function() {
        ok(type.number().notEmpty().val(0).validate());
        ok(type.number().notEmpty().val(0.0).validate());
        return ok(!type.number().notEmpty().val(1).validate());
      });
    });
    return describe("integer", function() {
      it("should have integer type", function() {
        return ok(type.integer);
      });
      it("should convert type", function() {
        strictEqual(type.integer().val("23dd").val(), "23dd");
        strictEqual(type.integer().val("23.11").val(), "23.11");
        strictEqual(type.integer().val("23").val(), 23);
        strictEqual(type.integer().val(23.11).val(), 23.11);
        strictEqual(type.integer().val("sfd").val(), "sfd");
        strictEqual(type.integer().val(null).val(), null);
        return strictEqual(type.integer().val(0).val(), 0);
      });
      return it("should support enum validate", function() {
        var sc;
        ok(!type.integer()["enum"]([1, 2, 3]).val(1).validate());
        ok(type.integer()["enum"]([1, 2, 3]).val(0).validate());
        sc = type.integer()["enum"]([2, 4]);
        equal(2, sc._enum[0]);
        return equal(4, sc._enum[1]);
      });
    });
  });

}).call(this);

},{"./helper":58}],61:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
(function() {
  var assert, deepEqual, equal, eve, fail, notDeepEqual, notEqual, notStrictEqual, ok, strictEqual, _ref;

  _ref = require("./helper"), assert = _ref.assert, ok = _ref.ok, fail = _ref.fail, equal = _ref.equal, notEqual = _ref.notEqual, deepEqual = _ref.deepEqual, notDeepEqual = _ref.notDeepEqual, strictEqual = _ref.strictEqual, notStrictEqual = _ref.notStrictEqual, eve = _ref.eve;

  describe("type", function() {
    var type;
    type = eve.type;
    return describe("object", function() {
      var schema;
      it("should have object type", function() {
        return ok(type.object);
      });
      schema = type.object({
        login: type.string().trim().lowercase().notEmpty().len(3, 12),
        email: type.string().trim().notEmpty().email()
      });
      it("should process value", function() {
        var val;
        val = schema.val({
          login: " Test ",
          email: "t@g.com"
        }).val();
        equal(val.login, "test");
        return ok(!schema.validate());
      });
      it("should process value of clone", function() {
        var sc, val;
        sc = schema.clone();
        val = sc.val({
          login: " Test ",
          email: "t@g.com"
        }).val();
        equal(val.login, "test");
        return ok(!sc.validate());
      });
      it("should be able to validate", function(done) {
        var errs;
        schema.val({
          login: "t",
          email: "g.com"
        });
        errs = schema.validate(function(errs) {
          ok(errs);
          equal(errs.messages().length, 2);
          return done();
        });
        return ok(errs);
      });
      it("should be able to validate clone", function(done) {
        var errs, sc;
        sc = schema.clone();
        sc.val({
          login: "t",
          email: "g.com"
        });
        errs = sc.validate(function(errs) {
          ok(errs);
          equal(errs.messages().length, 2);
          return done();
        });
        return ok(errs);
      });
      it("should be able to validate async", function(done) {
        schema = type.object({
          login: type.string().validator(function(val, next) {
            return setTimeout((function() {
              return next(val !== "admin");
            }), 100);
          }, "must be unique"),
          email: type.string().trim().email().validator(function(val, next) {
            return setTimeout((function() {
              return next(val !== "t@g.com");
            }), 100);
          }, "must be unique")
        });
        return schema.val({
          login: "admin",
          email: "t@g.com"
        }).validate(function(errs) {
          ok(errs);
          equal(errs.messages().length, 2);
          return done();
        });
      });
      it("should allow a not required inner object that is not empty when it exists", function(done) {
        var errs;
        schema = type.object({
          login: type.object({
            inner: type.string()
          }).notEmpty()
        });
        errs = schema.val({
          other: {}
        }).validate();
        ok(!errs);
        errs = schema.val({
          login: {}
        }).validate();
        ok(errs);
        return done();
      });
      it("should allow a not required inner object even if it has required attributes", function(done) {
        var errs;
        schema = type.object({
          login: type.object({
            inner: type.string().required()
          })
        });
        errs = schema.val({
          login: {}
        }).validate();
        ok(errs);
        errs = schema.val({
          other: {}
        }).validate();
        ok(!errs);
        return done();
      });
      it("should validate an object within an invalid object", function(done) {
        schema = type.object({
          test: type.object({
            login: type.string().trim().lowercase().notEmpty().len(3, 12),
            email: type.string().trim().notEmpty().email()
          })
        });
        return schema.val({
          test: {
            login: "admin",
            email: "tg.com"
          }
        }).validate(function(errs) {
          ok(errs);
          equal(errs.messages().length, 1);
          return done();
        });
      });
      it("should validate an object within a valid object", function(done) {
        schema = type.object({
          test: type.object({
            login: type.string().trim().lowercase().notEmpty().len(3, 12),
            email: type.string().trim().notEmpty().email()
          })
        });
        return schema.val({
          test: {
            login: "admin",
            email: "t@g.com"
          }
        }).validate(function(errs) {
          ok(!errs);
          return done();
        });
      });
      it("should add defaults to inner objects", function(done) {
        var obj;
        schema = type.object({
          test: type.object({
            login: type.string()["default"]('a').required(),
            email: type.string()["default"]('a@example.com').required().email()
          })
        });
        obj = schema.val({
          test: {
            login: "b"
          }
        });
        return obj.validate(function(errs, doc) {
          equal(obj.value().test.login, 'b');
          equal(obj.value().test.email, 'a@example.com');
          ok(!errs);
          return done();
        });
      });
      it("should be able to ignore undefined attribute", function() {});
      it("should be able to validate required attribute", function(done) {
        var errs;
        schema = type.object({
          login: type.string().required()
        });
        schema.val({
          nologin: "t"
        });
        errs = schema.validate(function(errs) {
          ok(errs);
          equal(errs.messages().length, 1);
          return done();
        });
        return ok(errs);
      });
      it("should be able be required itself", function() {
        var errs;
        schema = type.object({
          login: type.object({
            user: type.string().required()
          }).required()
        });
        schema.val({
          nologin: "t"
        });
        errs = schema.validate(function(errs) {
          ok(errs);
          return equal(errs.messages().length, 1);
        });
        ok(errs);
        schema.val({
          login: {
            user: "test"
          }
        });
        errs = schema.validate();
        return ok(!errs);
      });
      it("should support context in custom validator", function() {
        schema = type.object({
          login: type.string().validator(function(val) {
            ok(this.login);
            equal(this.login, "admin");
            return true;
          }),
          other: type.object({
            a: type.string()
          }).validator(function(val) {
            ok(this.login);
            return equal(this.login, "admin");
          })
        });
        return schema.val({
          login: "admin",
          other: {
            a: "hi"
          }
        }).validate();
      });
      it("should support context in custom validator with value assigned by default", function() {
        schema = type.object({
          login: type.string()["default"]('admon').validator(function(val) {
            ok(this.login);
            equal(this.login, "admon");
            return true;
          }),
          other: type.object({
            a: type.string()
          }).validator(function(val) {
            ok(this.login);
            return equal(this.login, "admon");
          })
        });
        return schema.val({
          other: {
            a: "hi"
          }
        }).validate();
      });
      it("should raise if array", function() {
        var errs;
        schema = type.object({
          test: type.string()
        }).required();
        errs = schema.val(["hi"]).validate(function(errs) {
          ok(errs);
          return equal(errs.messages().length, 1);
        });
        ok(errs);
        return equal(errs.messages().length, 1);
      });
      it("should raise if string", function() {
        var errs;
        schema = type.object({
          test: type.string()
        }).required();
        errs = schema.val("hi").validate(function(errs) {
          ok(errs);
          return equal(errs.messages().length, 1);
        });
        ok(errs);
        return equal(errs.messages().length, 1);
      });
      it("should raise if number", function() {
        var errs;
        schema = type.object({
          test: type.string()
        }).required();
        errs = schema.val(435).validate(function(errs) {
          ok(errs);
          return equal(errs.messages().length, 1);
        });
        ok(errs);
        return equal(errs.messages().length, 1);
      });
      it("should output with alias", function() {
        schema = type.object({
          login: type.string().alias("Login").trim().lowercase().notEmpty().len(3, 12),
          email: type.string().alias("Email").trim().notEmpty().email()
        });
        return schema.val({
          login: "t",
          email: "e"
        }).validate(function(err) {
          var msgs;
          ok(err);
          msgs = err.messages();
          ok(!msgs[0].indexOf("Login"));
          return ok(!msgs[1].indexOf("Email"));
        });
      });
      it("should be able to recognize type alias", function() {
        schema = type.object({
          login: String,
          email: String
        });
        return strictEqual(schema.val({
          login: "123"
        }).val().login, "123");
      });
      return it("should filter out unspecified fields", function() {
        var val;
        schema = type.object({
          login: type.string()
        });
        val = schema.val({
          login: "test",
          garbage: "123"
        }).val();
        ok(val.hasOwnProperty("login"));
        return ok(!val.hasOwnProperty("garbage"));
      });
    });
  });

}).call(this);

},{"./helper":58}],62:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
(function() {
  var assert, deepEqual, equal, eve, fail, notDeepEqual, notEqual, notStrictEqual, ok, strictEqual, type, _ref;

  _ref = require("./helper"), assert = _ref.assert, ok = _ref.ok, fail = _ref.fail, equal = _ref.equal, notEqual = _ref.notEqual, deepEqual = _ref.deepEqual, notDeepEqual = _ref.notDeepEqual, strictEqual = _ref.strictEqual, notStrictEqual = _ref.notStrictEqual, eve = _ref.eve;

  type = eve.type;

  describe("type", function() {
    beforeEach(function() {
      return this.schema = type.or([type.string().lowercase().notEmpty().len(3, 12), type.string().trim().notEmpty().email()]);
    });
    return describe("or", function() {
      it("should have or type", function() {
        return ok(type.or);
      });
      it("should process value a", function() {
        var val;
        val = this.schema.val("Test").val();
        equal(val, "test");
        return ok(!this.schema.validate());
      });
      it("should process value a for clones ", function() {
        var sc, val;
        sc = this.schema.clone();
        val = sc.val("Test").val();
        equal(val, "test");
        return ok(!sc.validate());
      });
      it("should process value b", function() {
        var val;
        val = this.schema.val("Ddddddddddddddddddddddddt@g.com ").val();
        equal(val, "Ddddddddddddddddddddddddt@g.com");
        return ok(!this.schema.validate());
      });
      it("should process value b for clone", function() {
        var sc, val;
        sc = this.schema.clone();
        val = sc.val("Ddddddddddddddddddddddddt@g.com ").val();
        equal(val, "Ddddddddddddddddddddddddt@g.com");
        return ok(!sc.validate());
      });
      it("should be able be required itself", function() {
        var errs, schema;
        schema = type.object({
          login: type.or([type.string().lowercase().notEmpty().len(3, 12), type.string().trim().notEmpty().email()]).required()
        });
        schema.val({
          nologin: "t"
        });
        errs = schema.validate(function(errs) {
          ok(errs);
          return equal(errs.messages().length, 1);
        });
        ok(errs);
        schema.val({
          login: "test"
        });
        errs = schema.validate();
        return ok(!errs);
      });
      it("should validate if not required", function() {
        var errs, schema;
        schema = type.object({
          login: type.or([type.string().lowercase().notEmpty().len(3, 12), type.string().trim().notEmpty().email()])
        });
        schema.val({
          nologin: "t"
        });
        errs = schema.validate();
        return ok(!errs);
      });
      it("should be able to validate if both fails", function(done) {
        var errs;
        this.schema.val("");
        errs = this.schema.validate(function(errs) {
          ok(errs);
          equal(errs.messages().length, 2);
          return done();
        });
        return ok(errs);
      });
      it("should be able to validate if one is valid", function(done) {
        var errs;
        this.schema.val("test");
        return errs = this.schema.validate(function(errs) {
          ok(!errs);
          return done();
        });
      });
      it("should be able to validate if both are valid", function(done) {
        var errs;
        this.schema.val("ddddt@g.com");
        return errs = this.schema.validate(function(errs) {
          ok(!errs);
          return done();
        });
      });
      it("should validate objects", function() {
        var schema, val;
        schema = type.or([
          type.object({
            login: type.string().trim().lowercase().notEmpty().len(3, 12),
            email: type.string().trim().notEmpty().email()
          })
        ]);
        val = schema.val({
          login: " Test ",
          email: "t@g.com"
        }).val();
        equal(val.login, "test");
        return ok(!schema.validate());
      });
      it("should validate invalid objects", function(done) {
        var errs, schema;
        schema = type.or([
          type.object({
            login: type.string().trim().lowercase().notEmpty().len(3, 12),
            email: type.string().trim().notEmpty().email()
          })
        ]);
        schema.val({
          login: "t",
          email: "g.com"
        });
        errs = schema.validate(function(errs) {
          ok(errs);
          equal(errs.messages().length, 2);
          return done();
        });
        return ok(errs);
      });
      it("should validate invalid objects for clones", function(done) {
        var errs, schema;
        schema = type.or([
          type.object({
            login: type.string().trim().lowercase().notEmpty().len(3, 12),
            email: type.string().trim().notEmpty().email()
          })
        ]).clone();
        schema.val({
          login: "t",
          email: "g.com"
        });
        errs = schema.validate(function(errs) {
          ok(errs);
          equal(errs.messages().length, 2);
          return done();
        });
        return ok(errs);
      });
      it("should be able to validate async", function(done) {
        var schema;
        schema = type.or([
          type.string().validator(function(val, next) {
            return setTimeout((function() {
              return next(val !== "admin");
            }), 100);
          }, "must not be admin"), type.string().trim().email().validator(function(val, next) {
            return setTimeout((function() {
              return next(val.length !== 5);
            }), 100);
          }, "must not have 5 chars")
        ]);
        return schema.val("admin").validate(function(errs) {
          ok(errs);
          equal(errs.messages().length, 3);
          return done();
        });
      });
      return it("should support custom validators", function() {
        var schema;
        schema = type.or([
          type.string().validator(function(val) {
            ok(this);
            equal(val, "admin");
            return true;
          })
        ]);
        return schema.val("admin").validate();
      });
    });
  });

}).call(this);

},{"./helper":58}],63:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
(function() {
  var assert, deepEqual, equal, eve, fail, notDeepEqual, notEqual, notStrictEqual, ok, strictEqual, _ref;

  _ref = require("./helper"), assert = _ref.assert, ok = _ref.ok, fail = _ref.fail, equal = _ref.equal, notEqual = _ref.notEqual, deepEqual = _ref.deepEqual, notDeepEqual = _ref.notDeepEqual, strictEqual = _ref.strictEqual, notStrictEqual = _ref.notStrictEqual, eve = _ref.eve;

  describe("type", function() {
    return describe("string", function() {
      var schema, type;
      type = eve.type;
      it("should have string type", function() {
        return ok(type.string);
      });
      schema = type.string().lowercase().trim().notEmpty().len(3, 12).match(/^[a-zA-Z0-9]*$/).validator(function(val, done) {
        return setTimeout((function() {
          return done(val !== "admin");
        }), 100);
      });
      it("should trim and lowercase", function() {
        return equal(schema.val(" Test ").val(), "test");
      });
      it("should have length in 3~12", function() {
        ok(schema.val("dd").validate());
        ok(type.string().len(3).val("dd").validate());
        return ok(!schema.val("test").validate());
      });
      it("should be a valid match", function() {
        return ok(schema.val("test-").validate());
      });
      it("should be unique", function(done) {
        return schema.val("admin").validate(function(err) {
          ok(err && err.messages());
          return done();
        });
      });
      it("should be an email address", function(done) {
        type.string().email().val("dd").validate(function(err) {
          return ok(err && err.messages());
        });
        type.string().email().val("sdf@wer.com").validate(function(err) {
          return ok(!err);
        });
        type.string().email("be an email").val("dd").validate(function(err) {
          ok(err);
          equal(err.messages().length, 1);
          equal(err.messages(true)[0], "be an email");
          return done();
        });
        return ok(type.string().email()._email);
      });
      it("should handle 'required' seperate from 'notEmpty'", function(done) {
        type.string().notEmpty().val(null).validate(function(err) {
          return ok(!err);
        });
        type.string().notEmpty().val("").validate(function(err) {
          return ok(err);
        });
        return done();
      });
      it("should be a url", function() {
        type.string().url().val("http").validate(function(err) {
          return ok(err && err.messages());
        });
        type.string().url().val("http://google.com").validate(function(err) {
          return ok(!err);
        });
        return ok(type.string().url()._url);
      });
      it("should be a string", function() {
        type.string().val(new Date()).validate(function(err) {
          return ok(err && err.messages());
        });
        type.string().val({}).validate(function(err) {
          return ok(err && err.messages());
        });
        return type.string().val([]).validate(function(err) {
          return ok(err && err.messages());
        });
      });
      it("should convert numbers", function() {
        type.string().val(4).validate(function(err) {
          return ok(!err);
        });
        return type.string().val(4.5).validate(function(err) {
          return ok(!err);
        });
      });
      return it("should support enum validate", function() {
        var sc;
        ok(!type.string()["enum"](["male", "famale"]).val("male").validate());
        ok(type.string()["enum"](["male", "famale"]).val("other").validate());
        sc = type.string()["enum"](["a", "b"]);
        equal("a", sc._enum[0]);
        return equal("b", sc._enum[1]);
      });
    });
  });

}).call(this);

},{"./helper":58}],64:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
(function() {
  var assert, deepEqual, equal, eve, fail, notDeepEqual, notEqual, notStrictEqual, ok, strictEqual, type, _ref;

  _ref = require("./helper"), assert = _ref.assert, ok = _ref.ok, fail = _ref.fail, equal = _ref.equal, notEqual = _ref.notEqual, deepEqual = _ref.deepEqual, notDeepEqual = _ref.notDeepEqual, strictEqual = _ref.strictEqual, notStrictEqual = _ref.notStrictEqual, eve = _ref.eve;

  type = eve.type;

  describe("type", function() {
    return describe("any", function() {
      it("should have any type", function() {
        return ok(type.any);
      });
      it("should check exist and empty", function() {
        ok(type.any().required().value(null).validate());
        ok(!type.any().required().value("").validate());
        ok(!type.any().notEmpty().value(null).validate());
        return ok(type.any().notEmpty().value("  ").validate());
      });
      it("should return in callback", function(done) {
        return type.any().required().value(null).validate(function(err) {
          ok(err);
          return done();
        });
      });
      it("should skip validator when empty", function(done) {
        return type.any().validator(function(val) {
          return val === 10;
        }).value(null).validate(function(err) {
          ok(!err);
          return done();
        });
      });
      it("should can add sync validator", function(done) {
        var schema;
        schema = type.any().validator(function(val) {
          return val === 10;
        }, "equal 10");
        ok(schema.value(9).validate());
        ok(!schema.value(10).validate());
        return schema.value(10).validate(function(err) {
          ok(!err);
          return done();
        });
      });
      it("should can add async validator", function(done) {
        var schema;
        schema = type.any().notEmpty().validator(function(val, done) {
          return setTimeout(function() {
            return done(val === 10);
          }, 100);
        }, "equal 10");
        return schema.value(10).validate(function(err) {
          ok(!err);
          return done();
        });
      });
      it("should set default value", function() {
        equal(type.any()["default"]("ok").value(null).value(), "ok");
        return equal(type.any()["default"]("ok").value(void 0).value(), "ok");
      });
      it("should can add a processor", function() {
        var schema;
        schema = type.any().processor(function(val) {
          return val * 2;
        });
        return equal(schema.value(10).value(), 20);
      });
      it("should output mssage with alias", function() {
        var err, schema;
        schema = type.any().alias("Name").notEmpty().validator(function(val) {
          return false;
        }, "is invalid");
        err = schema.val("test").validate();
        ok(err);
        return equal(err.messages()[0], "Name is invalid");
      });
      return it("should enable map Object to type", function() {
        ok(type(String) instanceof type.string);
        ok(type(type.string()) instanceof type.string);
        return ok(!type("not a type"));
      });
    });
  });

}).call(this);

},{"./helper":58}],65:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
(function() {
  var assert, deepEqual, equal, eve, fail, notDeepEqual, notEqual, notStrictEqual, ok, strictEqual, _ref;

  _ref = require("./helper"), assert = _ref.assert, ok = _ref.ok, fail = _ref.fail, equal = _ref.equal, notEqual = _ref.notEqual, deepEqual = _ref.deepEqual, notDeepEqual = _ref.notDeepEqual, strictEqual = _ref.strictEqual, notStrictEqual = _ref.notStrictEqual, eve = _ref.eve;

  describe("validator", function() {
    describe("type", function() {
      it("should recognise array", function() {
        return ok(eve.validator.isArray([]));
      });
      it("should recognise function", function() {
        ok(eve.validator.isFunction(function() {}));
        return ok(!eve.validator.isFunction(/d/));
      });
      it("should recognise object", function() {
        ok(eve.validator.isObject({}));
        ok(!eve.validator.isObject(""));
        ok(!eve.validator.isObject([]));
        ok(!eve.validator.isObject(function() {}));
        ok(!eve.validator.isObject(/d/));
        return ok(!eve.validator.isObject(new Date()));
      });
      it("should recognise data", function() {
        return ok(eve.validator.isDate(new Date()));
      });
      it("should recognise regexp", function() {
        return ok(eve.validator.isRegExp(/d/));
      });
      it("should recognise boolean", function() {
        ok(eve.validator.isBoolean(false));
        return ok(eve.validator.isBoolean(true));
      });
      return it("should recognise number", function() {
        ok(eve.validator.isNumber(1.2));
        ok(eve.validator.isInteger(1));
        return ok(!eve.validator.isInteger(1.2));
      });
    });
    describe("email", function() {
      return it("should recognise email", function() {
        ok(eve.validator.isEmail("test@mail.com"));
        ok(eve.validator.isEmail("test.pub@mail.com"));
        ok(eve.validator.isEmail("test-pub@mail.com"));
        return ok(!eve.validator.isEmail("test.mail.com"));
      });
    });
    describe("url", function() {
      return it("should recognise url", function() {
        ok(eve.validator.isUrl("http://g.com"));
        ok(eve.validator.isUrl("https://g.com"));
        ok(eve.validator.isUrl("https://g.cn"));
        return ok(eve.validator.isUrl("g.cn"));
      });
    });
    return describe("len", function() {
      it("should check right length of string", function() {
        ok(eve.validator.len("100", 3));
        ok(!eve.validator.len("100", 2, "4"));
        ok(eve.validator.len("100", 3, 4));
        return ok(!eve.validator.len("100", 4));
      });
      return it("should check right length of array", function() {
        ok(eve.validator.len([1, 3, 4], 3));
        ok(eve.validator.len([1, 3, 4], 3, 4));
        return ok(!eve.validator.len([1, 3, 4], 4));
      });
    });
  });

}).call(this);

},{"./helper":58}]},{},[1])
;