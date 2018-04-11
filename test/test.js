const YarnPreprocessor = require("../index");
const join = require("path").join;

const tests = [
	() => Promise.resolve().then(() => YarnPreprocessor.check({ path: join(process.cwd(), "test/data/sample") })).then(args => {
		if (!args || !args.shrinkwrap) { throw new Error("should add shrinkwrap"); }
		return "sample";
	}),
	() => Promise.resolve().then(() => YarnPreprocessor.check({ path: join(process.cwd(), "test/data/circular") })).then(args => {
		if (!args || !args.shrinkwrap) { throw new Error("should add shrinkwrap"); }
		return "circular";
	}),
	() => Promise.resolve().then(() => YarnPreprocessor.check({ path: join(process.cwd(), "test/data/outdated") })).then(() => {
		throw new Error("Should report yarn.lock files that are not in sync with package.json.");
	}, (err) => {
		if (err.message.indexOf("Unable to load yarn.lock for project \"outdated\"") < 0) {
			throw err;
		}
		if (err.message.indexOf("yarn.lock is outdated") < 0) {
			throw err;
		}
		return "outdated"
	}),
].map(t => t().then(result => [null, result], err => [err, null]));

Promise.all(tests).then((results) => {
	const oks = results.map(r => r[1]).filter(i => i !== null);
	const errors = results.map(r => r[0]).filter(i => i !== null);
	oks.forEach(test => console.info("✅  " + test + " ran successfully"));
	errors.forEach(error => console.error("🆘  ", error));
	if (errors.length > 0) { process.exit(1); }
}, e => {
	console.log("Unexpected test error", e);
});
