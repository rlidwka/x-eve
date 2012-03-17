var concat, error, merge, validator;
validator = require("./validator.js");
error = function() {
  var self;
  self = this;
  Error.call(self);
  Error.captureStackTrace && Error.captureStackTrace(self, arguments.callee);
  self.ok = false;
  self.name = 'EveError';
  self._messages = [];
  self._hasChildren = false;
  self._chlidrens = {};
  return this;
};
error.prototype = new Error;
error.prototype.constructor = error;
error.prototype.toString = function() {
  return this.name + ': ' + this.message;
};
error.prototype.alias = function(name) {
  return this._alias = name;
};
error.prototype.push = function(msg) {
  var self;
  self = this;
  self._messages.push(msg);
  self.message = concat(self.message, (self._alias ? self._alias + " " : "") + msg);
  return self.ok = true;
};
error.prototype.on = function(key, er) {
  var l;
  l = arguments.length;
  if (l === 1) {
    return this._chlidrens[key] || null;
  } else if (er instanceof error) {
    this._hasChildren = true;
    if (!this.ok) {
      this.ok = er.ok;
    }
    this._chlidrens[key] = er;
    return this.message = concat(this.message, er.message);
  }
};
error.prototype.at = error.prototype.on;
error.prototype.messages = function(withoutName) {
  var key, messages, msg, name, val, _i, _len, _msgs, _ref;
  messages = [];
  _msgs = this._messages;
  name = withoutName ? '' : this._alias || '';
  name = name ? name + " " : "";
  for (_i = 0, _len = _msgs.length; _i < _len; _i++) {
    msg = _msgs[_i];
    messages.push(name + msg);
  }
  if (this._hasChildren) {
    _ref = this._chlidrens;
    for (key in _ref) {
      val = _ref[key];
      merge(messages, val.messages(withoutName));
    }
  }
  if (messages.length) {
    return messages;
  } else {
    return null;
  }
};
concat = function(s1, s2) {
  if (s1 && s2) {
    return s1 + "\n" + s2;
  } else {
    return s1 || s2;
  }
};
merge = function(ar1, ar2) {
  var val, _i, _len, _results;
  if (!ar2) {
    return;
  }
  _results = [];
  for (_i = 0, _len = ar2.length; _i < _len; _i++) {
    val = ar2[_i];
    _results.push(ar1.push(val));
  }
  return _results;
};
module.exports = error;