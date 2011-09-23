/*!
* jschema 0.0.1
*
* Copyright (c) 2011 Hidden
* Released under the MIT, BSD, and GPL Licenses.
*
* Date: 2011-09-22
*/

var jschema = exports;
var validator = require("./validator.js");
var type = require("./type.js");

var number = require("./number.js");

/**
* Library version.
*/

jschema.version = '0.0.1';

/**
* Basic validator
*/

jschema.validator = validator;

/**
* Schema type
*/

jschema.type = type;
