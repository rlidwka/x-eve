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
		er1 = void 0;
		if (this._value === null || this._value === void 0) {
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
		var completed, done, errors, iterate, len, next, ob, schemas, self, _errors;
		ob = this._value;
		self = this;
		completed = 0;
		schemas = this.schemas;
		_errors = err || new error();
		len = schemas.length;
		this._valid_schema = void 0;
		iterate = function() {
			var sc;
			sc = schemas[completed];
			return sc.val(ob).validate(function(err) {
				if (!err) {
					self._valid_schema = sc;
					return next();
				} else {
				}
				if (err) {
					_errors.on(completed, err);
				}
				return next();
			});
		};
		next = function() {
			completed++;
			if (self._valid_schema || completed === len) {
				return done();
			} else {
				return iterate();
			}
		};
		errors = function() {
			if (self._valid_schema) {
				return null;
			}
			return _errors.ok && _errors || null;
		};
		done = function() {
			var e;
			e = errors();
			callback && callback(e);
			return e;
		};
		iterate();
		return errors();
	},
}, {
} );

