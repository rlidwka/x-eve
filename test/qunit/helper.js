QUnit = require("./qunit.js").QUnit;
var qunitTap = require("./qunit-tap.js").qunitTap;

var util = tryRequireThese("util", "system");
puts = (typeof util.log === 'function') ? console.log : util.print;

qunitTap(QUnit, puts, {noPlan: true});

QUnit.init();
QUnit.config.blocking = false;
QUnit.config.autorun = true;
QUnit.config.updateRate = 0;
QUnit.tap.showDetailsOnFailure = true;

assert = QUnit;
extend(global, QUnit);

function extend(a, b) {
	for ( var prop in b ) {
		a[prop] = b[prop];
	}
	return a;
}

function tryRequireThese() {
	var args = Array.prototype.slice.apply(arguments);
	for(var i=0; i < args.length; i+=1) {
		try {
			return require(args[i]);
		} catch(e) {
			// ignore
		}
	}
	throw new Error("cannot find moduele: " + args);
}
