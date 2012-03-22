var class2type, i, toString, type, types, validator;

type = function(obj) {
  if (!(obj != null)) {
    return String(obj);
  } else {
    return class2type[toString.call(obj)] || "object";
  }
};

toString = Object.prototype.toString;

class2type = {};

types = "Boolean Number String Function Array Date RegExp Object".split(" ");

i = types.length - 1;

while (i >= 0) {
  class2type["[object " + types[i] + "]"] = types[i].toLowerCase();
  i--;
}

validator = module.exports = {
  isArray: function(obj) {
    return type(obj) === "array";
  },
  isObject: function(obj) {
    return !!obj && type(obj) === "object";
  },
  isNumber: function(obj) {
    return type(obj) === "number";
  },
  isFunction: function(obj) {
    return type(obj) === "function";
  },
  isDate: function(obj) {
    return type(obj) === "date";
  },
  isRegExp: function(obj) {
    return type(obj) === "regexp";
  },
  isBoolean: function(obj) {
    return type(obj) === "boolean";
  },
  isString: function(obj) {
    return type(obj) === "string";
  },
  isInteger: function(obj) {
    return type(obj) === "number" && !(obj % 1);
  },
  isEmail: function(str) {
    return !!(str && str.match(/^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/));
  },
  isUrl: function(str) {
    return !!(str && str.match(/^(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?((?:(?:[-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2}))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/));
  },
  isAlpha: function(str) {
    return !!(str && str.match(/^[a-zA-Z]+$/));
  },
  isNumeric: function(str) {
    return !!(str && str.match(/^-?[0-9]+$/));
  },
  isAlphanumeric: function(str) {
    return !!(str && str.match(/^[a-zA-Z0-9]+$/));
  },
  isIp: function(str) {
    return !!(str && str.match(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/));
  },
  exists: function(obj) {
    return obj !== null && obj !== undefined;
  },
  notEmpty: function(obj) {
    return !!(obj !== null && obj !== undefined && !(obj + "").match(/^[\s\t\r\n]*$/));
  },
  equals: function(obj, eql) {
    return obj === eql;
  },
  contains: function(obj, item) {
    var n, t;
    if (!obj) return false;
    t = type(obj);
    if (type(obj.indexOf) === "function") {
      return obj.indexOf(item) !== -1;
    } else if (t === "array") {
      n = -1;
      i = obj.length - 1;
      while (i >= 0) {
        if (obj[i] === item) n = i;
        i--;
      }
      return n !== -1;
    }
    return false;
  },
  len: function(obj, minOrLen, max) {
    if (!obj) return false;
    if (typeof max === "number") {
      return obj.length >= minOrLen && obj.length <= max;
    } else {
      return obj.length === minOrLen;
    }
  },
  mod: function(val, by_, rem) {
    return val % (by_ || 1) === (rem || 0);
  }
};
