/**
 * error output
 */

var validator = require("./validator.js");

module.exports = error;

function error() {
	this.length = 0;
	this._messages = {};
	this._alias = {};
};

error.prototype.length = 0;

error.prototype.push = function(key, msgOrError, alias) {
	var self = this;
	key = key || '';
	var store = self._messages[key] = self._messages[key] || [];
	self.length ++;
	store.push( msgOrError );
	self._alias[key] = alias || self._alias[key];
};

error.prototype.on = function(key, withoutName) {
	var self = this;
	key = key || '';
	var store = self._messages[key]; 
	if( store && store.length ) {
		var messages = []
			, name = withoutName ? '' : ( self._alias[key] || key );
		name = name ? (name + " ") : "";
		for (var i = 0, l = store.length; i < l; i++) {
			var msg = store[i];
			if( msg instanceof error ) {
				merge(messages, msg.messages(withoutName));
			} else {
				messages.push( name + msg );
			}
		};
		return messages;
	} else {
		return null;
	}
};

error.prototype.messages = function(withoutName) {
	var messages = [];
	for (var key in this._messages) {
		merge(messages, this.on(key, withoutName));
	};
	return messages.length ? messages : null;
};

function merge (ar1, ar2) {
	if( !ar2 ) return;
	for (var i = 0, l = ar2.length; i < l; i++) {
		ar1.push( ar2[i] );
	};
}
