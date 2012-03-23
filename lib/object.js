(function() {
  var error, hasOwnProperty, message, objectPath, type, validator;

  objectPath = function(obj, selector) {
    this.obj = obj;
    this.selector = selector.split(".");
    return this;
  };

  validator = require("./validator.js");

  type = require("./type.js");

  message = require("./message.js");

  error = require("./error.js");

  type.extend("object", {
    init: function(schema) {
      var ar, push, self;
      push = function(path, val) {
        var key, sc, _results;
        sc = type(val);
        if (sc) {
          return ar.push([path, sc]);
        } else if (validator.isArray(val) && type.array) {
          if (path) return ar.push([path, type.array.apply(null, val)]);
        } else if (validator.isObject(val)) {
          _results = [];
          for (key in val) {
            _results.push(push((path ? path + "." + key : key), val[key]));
          }
          return _results;
        }
      };
      self = this;
      ar = self.schema = [];
      push(null, schema);
      return this;
    },
    afterValue: function() {
      var i, len, ob, path, sc, schema;
      ob = this._value;
      schema = this.schema;
      len = schema.length;
      i = 0;
      while (i < len) {
        sc = schema[i];
        path = new objectPath(ob, sc[0]);
        if (path.exists()) {
          path.set(sc[1].value(path.get()).value());
        } else {
          sc[1].value(null);
        }
        i++;
      }
      return this;
    },
    validate: function(callback) {
      var er1, er2, self;
      self = this;
      er1 = void 0;
      er2 = this._validate(function(err) {
        return er1 = self.validateChild(err, false, callback);
      });
      return er1 || er2;
    },
    validateChild: function(err, ignoreUndefined, callback) {
      var completed, done, errors, iterate, len, next, ob, schema, _errors;
      iterate = function() {
        var path, sc;
        sc = schema[completed];
        path = new objectPath(ob, sc[0]);
        if (ignoreUndefined && !path.exists()) return next();
        return sc[1].context(ob).validate((function(err) {
          if (err) _errors.on(sc[0], err);
          return next();
        }), ignoreUndefined);
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
      len = schema.length;
      iterate();
      return errors();
    }
  }, {
    alias: Object,
    check: function(obj) {
      return validator.isObject(obj);
    },
    from: function(obj) {
      if (validator.exists(obj)) {
        if (validator.isObject(obj)) {
          return obj;
        } else {
          return null;
        }
      } else {
        return obj;
      }
    },
    path: objectPath
  });

  hasOwnProperty = Object.prototype.hasOwnProperty;

  objectPath.prototype.exists = function() {
    var i, key, len, selector, val;
    val = this.obj;
    selector = this.selector;
    i = 0;
    len = selector.length;
    while (i < len) {
      key = selector[i];
      if (!val || !hasOwnProperty.call(val, key)) return false;
      val = val[key];
      i++;
    }
    return true;
  };

  objectPath.prototype.get = function() {
    var i, key, len, selector, val;
    val = this.obj;
    selector = this.selector;
    i = 0;
    len = selector.length;
    while (i < len) {
      key = selector[i];
      if (!val || !hasOwnProperty.call(val, key)) return undefined;
      val = val[key];
      i++;
    }
    return val;
  };

  objectPath.prototype.set = function(value) {
    var i, key, len, selector, val, _results;
    val = this.obj;
    selector = this.selector;
    if (!val) return;
    i = 0;
    len = selector.length;
    _results = [];
    while (i < len) {
      key = selector[i];
      if (i === (len - 1)) {
        val[key] = value;
      } else {
        if (!val[key]) val[key] = {};
        val = val[key];
      }
      _results.push(i++);
    }
    return _results;
  };

}).call(this);
