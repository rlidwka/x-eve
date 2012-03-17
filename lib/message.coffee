# i18n from:
# https://github.com/svenfuchs/rails-i18n/tree/master/rails/locale

message = module.exports = (key, msg, args) ->
	dict = message.dictionary[message._locale]
	str = (msg && ("" + msg)) || (dict && dict[key]) || "is invalid"
	if str && args
		str = str.replace /\{\{(.*?)\}\}/g, (a,b) -> args[b] || ""
	str

message.dictionary = {}
message._locale = 'en-US'

message.locale = ( name ) ->
	if !arguments.length
		#getter
		return message._locale

	#Store messages in message-en-US.js
	path = __dirname + "/message-" + name + ".js"
	try
		require path
	catch e
		#console.log("Not found: " + path)
	message._locale = name

message.store = (locale, data) ->
	dict = message.dictionary
	if typeof dict[locale] != "object"
		dict[locale] = {}
	
	dict = dict[locale]
	if data && typeof data == "object"
		dict[key] = data[key] for key, val of data

message.store "en-US",
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


