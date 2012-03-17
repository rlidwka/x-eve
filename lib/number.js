var message, numberInstance, type, validator;
validator = require("./validator.js");
type = require("./type.js");
message = require("./message.js");
numberInstance = {
  min: function(val, msg) {
    this.validator(function(num) {
      return num >= val;
    }, message("min", msg, {
      count: val
    }));
    return this;
  },
  max: function(val, msg) {
    this.validator(function(num) {
      return num <= val;
    }, message("max", msg, {
      count: val
    }));
    return this;
  },
  "enum": function(items, msg) {
    this.validator(function(num) {
      return validator.contains(items, num);
    }, message("enum", msg, {
      items: items.join(",")
    }));
    return this;
  }
};
type.extend("number", numberInstance, {
  alias: Number,
  check: function(obj) {
    return validator.isNumber(obj);
  },
  from: function(obj) {
    obj = parseFloat(obj);
    if (obj) {
      return obj;
    } else {
      if (obj === 0) {
        return 0;
      } else {
        return null;
      }
    }
  }
});
type.extend("integer", numberInstance, {
  check: function(obj) {
    return validator.isNumber(obj) && validator.mod(obj);
  },
  from: function(obj) {
    obj = parseInt(obj);
    if (obj) {
      return obj;
    } else {
      if (obj === 0) {
        return 0;
      } else {
        return null;
      }
    }
  }
});