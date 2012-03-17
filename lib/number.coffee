
# number and integer type.

validator = require "./validator.js"
type = require "./type.js"
message = require "./message.js"

numberInstance =
	min: (val, msg) ->
		@validator ( num ) ->
			num >= val
		, message("min", msg, count: val)
		@
	
	max: (val, msg) ->
		@validator ( num ) ->
			num <= val
		, message("max", msg, count: val)
		@
	
	enum: (items, msg) ->
		@validator ( num ) ->
			validator.contains( items, num )
		, message("enum", msg, items: items.join ",")
		@

type.extend "number", numberInstance,
	alias: Number
	check: ( obj ) -> validator.isNumber obj
	
	from: ( obj ) ->
		obj = parseFloat( obj )
		if obj then obj else ( if obj == 0 then 0 else null )
	
type.extend "integer", numberInstance,
	check: ( obj ) ->
		validator.isNumber( obj ) && validator.mod( obj )
	
	from: ( obj ) ->
		obj = parseInt obj, 10
		if obj then obj else ( if obj == 0 then 0 else null )
