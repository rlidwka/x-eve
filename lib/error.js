/**
 * error output
 */

var validator = require("./validator.js");

module.exports = error;

function error() {
	this.ok = false;
	this._messages = [];
	this._hasChildren = false;
	this._chlidrens = {};
};

error.prototype.alias = function(name) {
	this._alias = name;
};

error.prototype.push = function( msg ) {
	var self = this;
	this._messages.push( msg );
	this.ok = true;
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
			merge(messages, this._chlidrens[ key ].messages(withoutName) );
		};
	}

	return messages.length ? messages : null;
};

function merge (ar1, ar2) {
	if( !ar2 ) return;
	for (var i = 0, l = ar2.length; i < l; i++) {
		ar1.push( ar2[i] );
	};
}

