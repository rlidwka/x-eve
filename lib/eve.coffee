# EVE
#
# A JavaScript object schema, processor and validation lib.
#
# Copyright (c) 2011 Hidden
# Released under the MIT, BSD, and GPL Licenses.

eve = exports
validator = require "./validator"
type = require "./type"

require "./number"
require "./string"
require "./date"
require "./object"
require "./array"

# Library version.
eve.version = require(__dirname + "/../package.json")['version']

# Basic validator
eve.validator = validator

# Schema type
eve.type = type

# Error message
eve.message = require "./message"

# Error object
eve.error = require "./error"