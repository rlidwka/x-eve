var message, trim, type, validator, _trim, _trimRe;

validator = require("./validator.js");

type = require("./type.js");

message = require("./message.js");

_trimRe = /^\s+|\s+$/g;

_trim = String.prototype.trim;

trim = function(val) {
  return val && (_trim ? _trim.call(val) : val.replace(_trimRe, ""));
};

type.extend("string", {
  len: function(minOrLen, max, msg) {
    var last;
    last = arguments[arguments.length - 1];
    msg = typeof last === "number" ? null : last;
    this.validator((function(str) {
      return validator.len(str, minOrLen, max);
    }), typeof max === "number" ? message("len_in", msg, {
      min: minOrLen,
      max: max
    }) : message("len", msg, {
      len: minOrLen
    }));
    return this;
  },
  match: function(re, msg) {
    this.validator((function(str) {
      if (str && str.match(re)) {
        return true;
      } else {
        return false;
      }
    }), message("match", msg, {
      expression: "" + re
    }));
    return this;
  },
  "enum": function(items, msg) {
    this.validator((function(str) {
      return validator.contains(items, str);
    }), message("enum", msg, {
      items: items.join(",")
    }));
    return this;
  },
  email: function(msg) {
    this.validator((function(str) {
      if (str && validator.isEmail(str)) {
        return true;
      } else {
        return false;
      }
    }), message("email", msg));
    return this;
  },
  url: function(msg) {
    this.validator((function(str) {
      if (str && validator.isUrl(str)) {
        return true;
      } else {
        return false;
      }
    }), message("url", msg));
    return this;
  },
  lowercase: function() {
    this.processors.push(function(str) {
      if (str) {
        return str.toLowerCase();
      } else {
        return str;
      }
    });
    return this;
  },
  uppercase: function() {
    this.processors.push(function(str) {
      if (str) {
        return str.toUpperCase();
      } else {
        return str;
      }
    });
    return this;
  },
  trim: function() {
    this.processors.push(function(str) {
      if (str) {
        return trim(str);
      } else {
        return str;
      }
    });
    return this;
  }
}, {
  alias: String,
  check: function(obj) {
    return validator.isString(obj);
  },
  from: function(obj) {
    if (obj) {
      return String(obj);
    } else {
      return obj;
    }
  }
});
