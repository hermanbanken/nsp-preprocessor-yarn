const Fs = require('fs');
const Path = require('path');
const Lib = require('./lib.js');

module.exports = {
	check: function (args) {
		let pkg;
		try {
			pkg = JSON.parse(Fs.readFileSync(Path.join(args.path, 'package.json')));
		} catch (err) {
			return Promise.reject(new Error(`Unable to load package.json for project: ${Path.basename(args.path)}`));
		}

		let lock;
		try {
			let lockfile = 'yarn.lock';
			if (args.lockfile) {
				lockfile = args.lockfile;
			}
			const lockContents = Fs.readFileSync(Path.join(args.path, lockfile), { encoding: "utf-8" });
			lock = Lib.parse(lockContents, pkg);
		} catch (err) {
			return Promise.reject(new Error(`Unable to load yarn.lock for project "${Path.basename(args.path)}". ${err}`));
		}

		return Object.assign(args, { pkg: pkg, shrinkwrap: lock });
	}
};
