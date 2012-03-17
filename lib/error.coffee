# error output

validator = require("./validator.js")

error = () ->
	self = @
	Error.call( self )
	Error.captureStackTrace && Error.captureStackTrace( self, arguments.callee )
	self.ok = false
	self.name = 'EveError'
	self._messages = []
	self._hasChildren = false
	self._chlidrens = {}
	@

error.prototype = new Error
error.prototype.constructor = error

error.prototype.toString = () -> @name + ': ' + @message
error.prototype.alias = (name) -> @_alias = name

error.prototype.push = ( msg ) ->
	self = @
	self._messages.push msg
	self.message = concat self.message, ( if self._alias then (self._alias + " ") else "") + msg
	self.ok = true

error.prototype.on = ( key, er ) ->
	l = arguments.length
	if l == 1
		return @_chlidrens[ key ] || null
	else if er instanceof error
		@_hasChildren = true
		if !@ok
			@ok = er.ok
		
		@_chlidrens[ key ] = er
		@message = concat @message, er.message
	
error.prototype.at = error.prototype.on

error.prototype.messages = ( withoutName ) ->
	messages = []
	_msgs = @_messages
	name = if withoutName then '' else @_alias || ''
	name = if name then name + " " else ""

	messages.push( name + msg ) for msg in _msgs
	
	if ( @_hasChildren )
		merge messages, val.messages(withoutName) for key, val of @_chlidrens

	return if messages.length then messages else null

concat = (s1, s2) -> if s1 && s2 then s1 + "\n" + s2 else s1 || s2

merge = (ar1, ar2) ->
	return if !ar2
	ar1.push val for val in ar2


module.exports = error