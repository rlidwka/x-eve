
test:
	@NODE_ENV=test ./node_modules/.bin/mocha --slow 20 --growl \
		./test/*.test.js 

.PHONY: test
