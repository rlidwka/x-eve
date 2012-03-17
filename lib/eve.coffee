# EVE
#
# A JavaScript object schema, processor and validation lib.
#
# Copyright (c) 2011 Hidden
# Released under the MIT, BSD, and GPL Licenses.

eve = exports
validator = require("./validator.js")
type = require("./type.js")

require("./number.js")
require("./string.js")
require("./date.js")
require("./object.js")
require("./array.js")

# Library version.

eve.version = require(__dirname + "/../package.json")['version']

# Basic validator

eve.validator = validator

# Schema type

eve.type = type

# Error message

eve.message = require("./message.js")

# Error object

eve.error = require("./error.js")

