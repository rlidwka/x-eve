
test:
	@NODE_ENV=test ./node_modules/.bin/mocha --compilers coffee:coffee-script --slow 20 --growl \
		./test/*.test.coffee ./test/*.test.js 

browser:
	./node_modules/.bin/browserify browser.tests.js -o test/browser/browserify.js

.PHONY: test browser
