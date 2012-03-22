var message, type, validator;

validator = require("./validator.js");

type = require("./type.js");

message = require("./message.js");

type.extend("array", {
  init: function(schema) {
    var sc;
    sc = type(schema);
    if (!sc && validator.isObject(schema) && type.object) sc = type.object(schema);
    return this.schema = sc;
  },
  len: function(minOrLen, max, msg) {
    var last;
    last = arguments[arguments.length - 1];
    msg = (typeof last === "number" ? null : last);
    this.validator((function(ar) {
      return validator.len(ar, minOrLen, max);
    }), (typeof max === "number" ? message("len_in", msg, {
      min: minOrLen,
      max: max
    }) : message("len", msg, {
      len: minOrLen
    })));
    return this;
  },
  afterValue: function() {
    var i, len, ob, schema;
    ob = this._value;
    schema = this.schema;
    len = ob && ob.length;
    if (schema && len) {
      i = 0;
      while (i < len) {
        ob[i] = schema.val(ob[i]).val();
        i++;
      }
    }
    return this;
  },
  validate: function(callback) {
    var er1, er2, self;
    self = this;
    er1 = void 0;
    er2 = this._validate(function(err) {
      return er1 = self.schema && self._value && self._value.length && self.validateChild(err, callback) || null;
    });
    return er1 || er2;
  },
  validateChild: function(err, callback) {
    var completed, done, errors, iterate, len, next, ob, schema, _errors;
    iterate = function() {
      var item;
      item = ob[completed];
      return schema.val(item).validate(function(err) {
        if (err) _errors.on(completed, err);
        return next();
      });
    };
    next = function() {
      completed++;
      if (completed === len) {
        return done();
      } else {
        return iterate();
      }
    };
    errors = function() {
      return _errors.ok && _errors || null;
    };
    done = function() {
      var e;
      e = errors();
      callback && callback(e);
      return e;
    };
    ob = this._value;
    completed = 0;
    schema = this.schema;
    _errors = err || new error();
    len = ob.length;
    iterate();
    return errors();
  }
}, {
  alias: Array,
  check: function(obj) {
    return validator.isArray(obj);
  },
  from: function(obj) {
    if (validator.exists(obj)) {
      if (validator.isArray(obj)) {
        return obj;
      } else {
        if (typeof obj === "string") return obj.split(",");
      }
    } else {
      return obj;
    }
    return null;
  }
});
