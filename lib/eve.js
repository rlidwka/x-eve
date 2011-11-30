/*!
* eve 0.0.1
*
* Copyright (c) 2011 Hidden
* Released under the MIT, BSD, and GPL Licenses.
*
* Date: 2011-09-22
*/

var eve = exports;
var validator = require("./validator.js");
var type = require("./type.js");

require("./number.js");
require("./string.js");
require("./date.js");
require("./object.js");

/**
* Library version.
*/

eve.version = require(__dirname + "/../package.json")['version'];

/**
* Basic validator
*/

eve.validator = validator;

/**
* Schema type
*/

eve.type = type;

/**
* Error message
*/
eve.message = require("./message.js");


