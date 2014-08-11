
module.exports = require('./lib/eve');

/**package
{ "name": "x-eve",
  "version": "0.0.0",
  "dependencies": {},
  "scripts": {"postinstall": "node -e 'console.log(JSON.stringify(eval(\"(\"+require(\"fs\").readFileSync(\"./package.json5\")+\")\")))' > package.json ; npm install"}
}
**/
