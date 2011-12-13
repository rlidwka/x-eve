/**
 * array type.
 */

var validator = require("./validator.js");
var type = require("./type.js");
var message = require("./message.js");

type.extend( "array", {

	/**
	 * Init with item schema
	 * @param {Object} schema
	 *
	 */
	init: function( schema ) {
		this.schema = schema;
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
		var self  = this;
		var er1
			, er2 = this._validate( function( err ) {
				er1 = self.schema && self._value && self._value.length && self.validateChild( err, callback ) || null;
			} );
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
			if( validator.isArray( obj ) ) {
				return obj;
			} else if ( typeof obj === "string" ) {
				return obj.split(",");
			}
		} else {
			return obj;
		}
		return null;
	}
} );

//type.crood = type.array(type.number().min(-90).max(90)).len(2).defined();
//type.crood()


