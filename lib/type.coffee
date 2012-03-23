# any type
# required,notEmpty,default,validator,processor

validator = require("./validator.js")
message = require("./message.js")
error = require("./error.js")
moduler = require './moduler'

# map key -> type 
#  type( Date ) => type.date()
#

_mapper = {} 

process = (schema, val, context) ->
  processors = schema.processors
  len = processors.length
  fn = (processor) -> val = processor.call(context || null, val)
  fn processor for processor in processors
  val

type = module.exports = ( key ) ->
  if( key && key.type && type[key.type] && key instanceof type[key.type] )
    #Check type
    return key
  
  if _mapper[key]
    key = _mapper[key]
  else 
    key = null

  return key && type[ key ] && type[ key ]() || null

class instanceMethods
  init: () -> @
  
  required: ( msg ) ->
    @_required = message("required", msg)
    return @
  
  notEmpty: ( msg ) ->
    @_notEmpty = message("notEmpty", msg)
    return @
  
  # Set/Get default value
  default: (value) ->
    if( !arguments.length ) 
      return if (typeof @_default == 'function') then @_default() else @_default
    @_default = value
    return @
  
  # Set/Get alias value
  alias: ( value ) ->
    if( !arguments.length ) 
      return if (typeof @_alias == 'function') then @_alias() else @_alias
    
    @_alias = value
    return @
  
  context: ( context ) ->
    @_context = context
    return @
  
  validator: (fn, msg) ->
    @validators.push([fn, message("invalid", msg)])
    return @
  
  processor: (fn) ->
    @processors.push(fn)
    return @
  
  _validate: ( callback ) ->
    return validate( @, @_value, callback, @_context )
  
  validate: ( callback ) ->
    return @_validate( callback )
  
  process: () ->
    @_value = process(@, @_value)

  exists: -> @required

class staticMethods
  check: () -> true
  from: (val) -> val

class ValFn
  constructor: (any, name) ->
    @type = name #For check if schema
    @_default = null
    @_value = null
    @_required = false
    @_notEmpty = false
    @any = any

  valFn: (value) ->
    if( !arguments.length ) then return @._value
    if validator.exists(value)
      #value = value 
    else 
      value = @default() || value
    
    if (typeof @any.from == "function") 
      @_value = @any.from( value ) 
    else 
      @_value = value
    @process()
    @afterValue && @afterValue()
    return @

  value: () -> @valFn arguments
  val: () -> @valFn arguments


#staticMethods =
#  check: () -> true
#  from: (val) -> val

extend = (name, instance, static) ->
  if( !name ) then return
  any = type[name]
  if( !any ) 
    any = type[name] = ( args ) ->
      # Return an instance when call any()
      # http://ejohn.org/blog/simple-class-instantiation/
      if ( @ instanceof arguments.callee ) 
        @validators = []
        @processors = []
        if ( typeof @init == "function" )
          @init.apply( @, if args.callee then args else arguments )
        return @
      else 
        return new arguments.callee( arguments )
    
    valfn = new ValFn any, name

    moduler.mixer any.prototype, valfn.prototype
    moduler.includer any, instanceMethods
    moduler.extender any, staticMethods
  
  moduler.mixer any.prototype, instance
  static && static.alias && ( _mapper[static.alias] = name ) #map alias -> type
  moduler.mixer any, static


validate = (schema, val, callback, context) ->
  validators = schema.validators
  len = validators.length
  required = schema._required
  notExists = !validator.exists(val)
  notEmpty = schema._notEmpty
  completed = 0
  _errors = new error()

  _errors.alias schema.alias()

  errors = () -> _errors.ok && _errors || null

  done = () ->
    e = errors()
    validator.isFunction( callback ) && callback(e)
    e

  #Check required
  if required && notExists
    _errors.push required
    return done()
  
  empty = !validator.notEmpty val
  #Check empty
  if empty
    notEmpty && _errors.push( notEmpty )
    return done()

  if !len
    return done()

  iterate = () ->
    __validator = validators[completed]
    fn = __validator[0]
    msg = __validator[1]
    async = true
    stopWhenError = __validator[2]
    #async
    valid = fn.call context || null, val, (ok) ->
      if ( !async ) then return
      if(!ok)
        _errors.push( msg )
        if( stopWhenError ) then return done()
      next()
    
    #sync valid
    if typeof valid == "boolean"
      async = false
      if !valid
        _errors.push msg
        if stopWhenError then return done()
      next()

  next = () =>
    completed++
    if( completed == len ) 
      done()
    else
      iterate()

  iterate()
  return errors()




extend("any")

type.extend = extend