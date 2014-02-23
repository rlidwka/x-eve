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
	self._childrens = {};
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
		return this._childrens[ key ] || null;
	} else if( er instanceof error ) {
		this._hasChildren = true;
		if( !this.ok ) {
			this.ok = er.ok;
		}
		this._childrens[ key ] = er;
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
		for ( var key in this._childrens ) {
			merge( messages, this._childrens[ key ].messages(withoutName) );
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

