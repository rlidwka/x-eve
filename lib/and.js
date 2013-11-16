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

