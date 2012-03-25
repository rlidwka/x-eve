(function() {
  var Any, error, extend, instanceMethods, message, moduler, process, staticMethods, type, validate, validator, _mapper;

  validator = require("./validator.js");

  message = require("./message.js");

  error = require("./error.js");

  moduler = require('./moduler');

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

  instanceMethods = (function() {

    function instanceMethods() {}

    instanceMethods.prototype.init = function() {
      return this;
    };

    instanceMethods.prototype.required = function(msg) {
      this._required = message("required", msg);
      return this;
    };

    instanceMethods.prototype.notEmpty = function(msg) {
      this._notEmpty = message("notEmpty", msg);
      return this;
    };

    instanceMethods.prototype["default"] = function(value) {
      if (!arguments.length) {
        if (typeof this._default === 'function') {
          return this._default();
        } else {
          return this._default;
        }
      }
      this._default = value;
      return this;
    };

    instanceMethods.prototype.alias = function(value) {
      if (!arguments.length) {
        if (typeof this._alias === 'function') {
          return this._alias();
        } else {
          return this._alias;
        }
      }
      this._alias = value;
      return this;
    };

    instanceMethods.prototype.context = function(context) {
      this._context = context;
      return this;
    };

    instanceMethods.prototype.validator = function(fn, msg) {
      this.validators.push([fn, message("invalid", msg)]);
      return this;
    };

    instanceMethods.prototype.processor = function(fn) {
      this.processors.push(fn);
      return this;
    };

    instanceMethods.prototype._validate = function(callback) {
      return validate(this, this._value, callback, this._context);
    };

    instanceMethods.prototype.validate = function(callback) {
      return this._validate(callback);
    };

    instanceMethods.prototype.process = function() {
      return this._value = process(this, this._value);
    };

    instanceMethods.prototype.exists = function() {
      return this.required;
    };

    return instanceMethods;

  })();

  staticMethods = (function() {

    function staticMethods() {}

    staticMethods.prototype.check = function() {
      return true;
    };

    staticMethods.prototype.from = function(val) {
      return val;
    };

    return staticMethods;

  })();

  Any = (function() {

    Any.create = function(name) {
      var step, _any;
      _any = type[name];
      if (!_any) {
        step = new Any(name);
        _any = type[name] = step.any();
        moduler.mixer(_any.prototype, step);
        moduler.includer(_any, instanceMethods);
        moduler.extender(_any, staticMethods);
      }
      return _any;
    };

    function Any(name) {
      var __any;
      this.type = name;
      this._default = null;
      this._value = null;
      this._required = false;
      this._notEmpty = false;
      __any = function(args) {
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
      this.any = function() {
        return __any;
      };
      this.valFn = function(value) {
        if (!arguments.length) return this._value;
        if (validator.exists(value)) {} else {
          value = this["default"]() || value;
        }
        if (typeof __any.from === "function") {
          this._value = __any.from(value);
        } else {
          this._value = value;
        }
        this.process();
        this.afterValue && this.afterValue();
        return this;
      };
      this.val = this.valFn;
      this.value = this.valFn;
    }

    return Any;

  })();

  extend = function(name, instance, static) {
    var any;
    if (!name) return;
    any = Any.create(name);
    moduler.mixer(any.prototype, instance);
    static && static.alias && (_mapper[static.alias] = name);
    return moduler.mixer(any, static);
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

}).call(this);
