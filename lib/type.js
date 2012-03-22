var error, extend, instanceMethods, message, mix, process, staticMethods, type, validate, validator, _mapper;

validator = require("./validator.js");

message = require("./message.js");

error = require("./error.js");

_mapper = {};

process = function(schema, val, context) {
  var fn, len, processor, processors, _i, _len;
  processors = schema.processors;
  len = processors.length;
  fn = function(processor) {
    return val = processor.call(context || null, val);
  };
  for (_i = 0, _len = processors.length; _i < _len; _i++) {
    processor = processors[_i];
    fn(processor);
  }
  return val;
};

type = module.exports = function(key) {
  if (key && key.type && type[key.type] && key instanceof type[key.type]) {
    return key;
  }
  if (_mapper[key]) {
    key = _mapper[key];
  } else {
    key = null;
  }
  return key && type[key] && type[key]() || null;
};

instanceMethods = {
  init: function() {
    return this;
  },
  required: function(msg) {
    this._required = message("required", msg);
    return this;
  },
  notEmpty: function(msg) {
    this._notEmpty = message("notEmpty", msg);
    return this;
  },
  "default": function(value) {
    if (!arguments.length) {
      if (typeof this._default === 'function') {
        return this._default();
      } else {
        return this._default;
      }
    }
    this._default = value;
    return this;
  },
  alias: function(value) {
    if (!arguments.length) {
      if (typeof this._alias === 'function') {
        return this._alias();
      } else {
        return this._alias;
      }
    }
    this._alias = value;
    return this;
  },
  context: function(context) {
    this._context = context;
    return this;
  },
  validator: function(fn, msg) {
    this.validators.push([fn, message("invalid", msg)]);
    return this;
  },
  processor: function(fn) {
    this.processors.push(fn);
    return this;
  },
  _validate: function(callback) {
    return validate(this, this._value, callback, this._context);
  },
  validate: function(callback) {
    return this._validate(callback);
  },
  process: function() {
    return this._value = process(this, this._value);
  }
};

instanceMethods.exists = instanceMethods.required;

staticMethods = {
  check: function() {
    return true;
  },
  from: function(val) {
    return val;
  }
};

mix = function(a, b) {
  var k, v;
  if (b) {
    for (k in b) {
      v = b[k];
      a[k] = v;
    }
  }
  return a;
};

extend = function(name, instance, static) {
  var any, valFn;
  if (!name) return;
  any = type[name];
  if (!any) {
    any = type[name] = function(args) {
      if (this instanceof arguments.callee) {
        this.validators = [];
        this.processors = [];
        if (typeof this.init === "function") {
          this.init.apply(this, args.callee ? args : arguments);
        }
        return this;
      } else {
        return new arguments.callee(arguments);
      }
    };
    valFn = function(value) {
      var self;
      self = this;
      if (!arguments.length) return self._value;
      if (validator.exists(value)) {} else {
        value = self["default"]() || value;
      }
      if (typeof any.from === "function") {
        self._value = any.from(value);
      } else {
        self._value = value;
      }
      self.process();
      self.afterValue && self.afterValue();
      return self;
    };
    mix(any.prototype, {
      type: name,
      _default: null,
      _value: null,
      _required: false,
      _notEmpty: false,
      value: valFn,
      val: valFn
    });
    mix(any.prototype, instanceMethods);
    mix(any, staticMethods);
  }
  mix(any.prototype, instance);
  static && static.alias && (_mapper[static.alias] = name);
  return mix(any, static);
};

validate = function(schema, val, callback, context) {
  var completed, done, empty, errors, iterate, len, next, notEmpty, notExists, required, validators, _errors,
    _this = this;
  validators = schema.validators;
  len = validators.length;
  required = schema._required;
  notExists = !validator.exists(val);
  notEmpty = schema._notEmpty;
  completed = 0;
  _errors = new error();
  _errors.alias(schema.alias());
  errors = function() {
    return _errors.ok && _errors || null;
  };
  done = function() {
    var e;
    e = errors();
    validator.isFunction(callback) && callback(e);
    return e;
  };
  if (required && notExists) {
    _errors.push(required);
    return done();
  }
  empty = !validator.notEmpty(val);
  if (empty) {
    notEmpty && _errors.push(notEmpty);
    return done();
  }
  if (!len) return done();
  iterate = function() {
    var async, fn, msg, stopWhenError, valid, __validator;
    __validator = validators[completed];
    fn = __validator[0];
    msg = __validator[1];
    async = true;
    stopWhenError = __validator[2];
    valid = fn.call(context || null, val, function(ok) {
      if (!async) return;
      if (!ok) {
        _errors.push(msg);
        if (stopWhenError) return done();
      }
      return next();
    });
    if (typeof valid === "boolean") {
      async = false;
      if (!valid) {
        _errors.push(msg);
        if (stopWhenError) return done();
      }
      return next();
    }
  };
  next = function() {
    completed++;
    if (completed === len) {
      return done();
    } else {
      return iterate();
    }
  };
  iterate();
  return errors();
};

extend("any");

type.extend = extend;
