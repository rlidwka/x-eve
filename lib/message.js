var message;
message = module.exports = function(key, msg, args) {
  var dict, str;
  dict = message.dictionary[message._locale];
  str = (msg && ("" + msg)) || (dict && dict[key]) || "is invalid";
  if (str && args) {
    str = str.replace(/\{\{(.*?)\}\}/g, function(a, b) {
      return args[b] || "";
    });
  }
  return str;
};
message.dictionary = {};
message._locale = 'en-US';
message.locale = function(name) {
  var path;
  if (!arguments.length) {
    return message._locale;
  }
  path = __dirname + "/message-" + name + ".js";
  try {
    require(path);
  } catch (e) {

  }
  return message._locale = name;
};
message.store = function(locale, data) {
  var dict, key, val, _results;
  dict = message.dictionary;
  if (typeof dict[locale] !== "object") {
    dict[locale] = {};
  }
  dict = dict[locale];
  if (data && typeof data === "object") {
    _results = [];
    for (key in data) {
      val = data[key];
      _results.push(dict[key] = data[key]);
    }
    return _results;
  }
};
message.store("en-US", {
  "invalid": "is invalid",
  "required": "is required",
  "notEmpty": "can't be empty",
  "len": "should have length {{len}}",
  "len_in": "should have max length {{max}} and min length {{min}}",
  "match": "should match {{expression}}",
  "email": "must be an email address",
  "url": "must be a url",
  "min": "must be greater than or equal to {{count}}",
  "max": "must be less than or equal to {{count}}",
  "taken": "has already been taken",
  "enum": "must be included in {{items}}"
});