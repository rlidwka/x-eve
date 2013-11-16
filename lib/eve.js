/*!
*
* EVE
*
* A JavaScript object schema, processor and validation lib.
*
* Copyright (c) 2011 Hidden
* Released under the MIT, BSD, and GPL Licenses.
*
*/

var eve = exports;
var validator = require("./validator.js");
var type = require("./type.js");

require("./number.js");
require("./string.js");
require("./date.js");
require("./object.js");
require("./array.js");
require("./or");
require("./and");
require("./bool");

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

/**
* Error object
*/
eve.error = require("./error.js");

