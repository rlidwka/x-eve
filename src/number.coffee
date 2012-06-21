# number and integer type.

validator = require "./validator"
type = require "./type"
message = require "./message"

class type._number extends type.Base
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
    @_enum = items
    @validator ( num ) ->
      validator.contains( items, num )
    , message("enum", msg, items: items.join ",")
    @

  @alias: Number
  @check: ( obj ) -> validator.isNumber obj

    #obj = parseFloat( obj )
    #if obj then obj else ( if obj == 0 then 0 else null )

type.register 'number', type._number

class type._integer extends type._number
  @check: ( obj ) -> validator.isNumber( obj ) && validator.mod( obj )


type.register 'integer', type._integer