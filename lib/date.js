var message, type, validator;
validator = require("./validator.js");
type = require("./type.js");
message = require("./message.js");
type.extend("date", {}, {
  alias: Date,
  check: function(obj) {
    return validator.isDate(obj);
  },
  from: function(obj) {
    var time;
    if (obj instanceof Date) {
      return obj;
    }
    if ('string' === typeof obj) {
      if ("" + parseInt(obj) === obj) {
        return new Date(parseInt(obj) * Math.pow(10, 13 - obj.length));
      }
      if (obj.length === 14) {
        return new Date(obj.obj.replace(/^(\d\d\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, "$1-$2-$3 $4:$5:$6"));
      }
      time = Date.parse(obj);
      if (time) {
        return new Date(time);
      } else {
        return null;
      }
    }
    if ('number' === typeof obj) {
      return new Date(obj * Math.pow(10, 13 - ("" + obj).length));
    }
    if (obj) {
      return null;
    } else {
      return obj;
    }
  }
});