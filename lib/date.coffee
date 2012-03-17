
# date type.
#
# date from number,date,string


validator = require "./validator.js"
type = require "./type.js"
message = require "./message.js"

type.extend "date", {
}, 
	alias: Date
	check: (obj) -> validator.isDate obj

	from: (obj) ->
		return obj if obj instanceof Date
			
		if 'string' == typeof obj
			#number
			if "" + parseInt(obj) == obj
				return new Date parseInt(obj) * Math.pow(10, 13 - obj.length)
			if obj.length == 14
				return new Date obj.obj.replace(/^(\d\d\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, "$1-$2-$3 $4:$5:$6")

			#TODO: test rfc3339 for browser IE...
			time = Date.parse obj
			return if time then new Date time else null

		if 'number' == typeof obj
			return new Date obj * Math.pow(10, 13 - ("" + obj).length)
		
		if obj then null else obj



