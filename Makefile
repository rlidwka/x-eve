
test:
	@NODE_ENV=test ./node_modules/.bin/mocha --compilers coffee:coffee-script/register --slow 20 --growl \
		./test/*.test.coffee

browser:
	./node_modules/.bin/browserify browser.tests.js -o test/browser/browserify.js

.PHONY: test browser
