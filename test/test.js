const YarnPreprocessor = require("../index");
const join = require("path").join;
const Fs = require('fs');

function opts(path) {
	return {
		path: join(process.cwd(), path),
		pkg: JSON.parse(Fs.readFileSync(join(process.cwd(), path, "test.package.json")))
	}
}

const tests = [
	() => Promise.resolve().then(() => YarnPreprocessor.check(opts("test/data/sample"))).then(args => {
		if (!args || !args.shrinkwrap) { throw new Error("should add shrinkwrap"); }
		return "sample";
	}),
	() => Promise.resolve().then(() => YarnPreprocessor.check(opts("test/data/circular"))).then(args => {
		if (!args || !args.shrinkwrap) { throw new Error("should add shrinkwrap"); }
		return "circular";
	}),
	() => Promise.resolve().then(() => YarnPreprocessor.check(opts("test/data/outdated"))).then(() => {
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
	() => Promise.resolve().then(() => YarnPreprocessor.check(Object.assign(opts("test/data/workspace/package-1"), { lockfile: "../yarn.lock" }))).then((args) => {
		if (!args || !args.shrinkwrap) { throw new Error("should add shrinkwrap"); }
		if (!args.shrinkwrap.dependencies.marked.dependencies.request) { throw new Error("should find nested dependencies from the workspace yarn.lock"); }
		return "workspace-package-vulnerable"
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
