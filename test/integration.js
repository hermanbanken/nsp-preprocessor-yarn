const exec = require("child_process").exec;
const join = require("path").join;
let errors = [];
let oks = [];

function contains(stderr, stdout, text) {
	return stderr.indexOf(text) >= 0 || stdout.indexOf(text) >= 0;
}

const tests = [
	exec("nsp --preprocessor yarn check", { cwd: join(process.cwd(), "test/data/sample") }, (err, stdout, stderr) => {
		if (!contains(stderr, stdout, "3 vulnerabilities found")) {
			errors.push("Should report vulnerabilities from yarn.lock.");
		} else { oks.push("sample"); }
		finish();
	}),
	exec("nsp --preprocessor yarn check", { cwd: join(process.cwd(), "test/data/circular") }, (err, stdout, stderr) => {
		if (!contains(stderr, stdout, "3 vulnerabilities found")) {
			errors.push("Should work, even with circular dependencies.");
		} else { oks.push("circular"); }
		finish();
	}),
	exec("nsp --preprocessor yarn check", { cwd: join(process.cwd(), "test/data/outdated") }, (err, stdout, stderr) => {
		if (!contains(stderr, stdout, "yarn.lock is outdated")) {
			errors.push("Should report yarn.lock files that are not in sync with package.json." + err + stderr + stdout);
		} else { oks.push("outdated"); }
		finish();
	}),
	exec("nsp --preprocessor yarn check --lockfile ../yarn.lock", { cwd: join(process.cwd(), "test/data/workspace/package-1") }, (err, stdout, stderr) => {
		if (!contains(stderr, stdout, "3 vulnerabilities found")) {
			errors.push("Should report vulnerabilities from yarn.lock.");
		} else { oks.push("workspace-package-1"); }
		finish();
	}),
	exec("nsp --preprocessor yarn check --lockfile ../yarn.lock", { cwd: join(process.cwd(), "test/data/workspace/package-2") }, (err, stdout, stderr) => {
		if (!contains(stderr, stdout, "No known vulnerabilities found")) {
			errors.push("Should not report vulnerabilities of other packages in the workspaces yarn.lock.");
		} else { oks.push("workspace-package-2"); }
		finish();
	})

];

function finish() {
	if (oks.length + errors.length < tests.length) { return; }
	oks.forEach(test => console.info("✅  " + test + " ran successfully"));
	errors.forEach(error => console.error("🆘  " + error));
	if (errors.length > 0) { process.exit(1); }
}