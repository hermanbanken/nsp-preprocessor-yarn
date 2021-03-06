const Lockfile = require('@yarnpkg/lockfile');

function yarnParse(contents, packageJson) {
	var result = Lockfile.parse(contents);
	var dependencies = Object.keys(packageJson)
		.filter(key => packageJson.hasOwnProperty(key))
		.reduce(function (acc, key) {
			return isDependenciesField(key, packageJson[key]) ?
				Object.assign(acc, packageJson[key]) :
				acc;
		}, {});
	return {
		name: packageJson.name,
		version: packageJson.version,
		dependencies: buildTree(dependencies, result.object, [packageJson.name])
	};
}

function buildTree(dependencies, yarn, path) {
	return Object.keys(dependencies).reduce(function (acc, packageName) {

		var version = dependencies[packageName];
		var packageNV = packageName + '@' + version;
		var info = yarn[packageNV];

		if (!info) {
			throw new Error('yarn.lock is outdated: it does not contain the package ' + packageNV);
		}

		if (path.indexOf(packageNV) >= 0) {
			// Prevent looping over circular dependencies (for example babel-register@^6.26.0 > babel-core@^6.26.0 > babel-register@^6.26.0)
			return acc;
		}
		var currentPath = path.slice(0);
		currentPath.push(packageNV);

		acc[packageName] = {
			'version': info.version,
			'dependencies': typeof info.dependencies === 'object' ?
				buildTree(info.dependencies, yarn, currentPath) :
				undefined
		};
		return acc;
	}, {});
}

function isDependenciesField(key, object) {
	return whitelist.indexOf(key) >= 0 && typeof object === 'object' && key !== 'engines';
}

const whitelist = [
  'name',
  'version',
  'engine',
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
  'bundleDependencies',
  'bundledDependencies'
];

module.exports = { parse: yarnParse, buildTree: buildTree };
