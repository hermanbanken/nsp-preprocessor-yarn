# Yarn.lock preprocessor for NSP

Usage:

````bash
npm install -g nsp nsp-preprocessor-yarn
nsp check --preprocessor yarn
````

Or, automating the nsp check upon testing:

````
{
  "name": "dummy",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "posttest": "nsp check --preprocessor yarn"
  },
  "dependencies": {
    "nsp": "git://github.com/nodesecurity/nsp.git#41f967f",
    "nsp-preprocessor-yarn": "nsp-preprocessor-yarn"
  }
}
````

If it logs `Preprocessing the lock file 'yarn.lock'.` this means you're covered.

## Why
**TLDR**: if you use Yarn and NSP you need a preprocessor like nsp-preprocessor-yarn, to ensure all your dependencies are checked.

NSP works by uploading (parts of) your package.json and npm-shrinkwrap/package-lock to it's vulnerabillity-checking servers.
If you don't have a npm-shrinkwrap/package-lock (hello there, Yarn users!) this means NSP only uploads a package.json.
Therefore NSP reconstructs your dependency tree on their servers, in the NPM fashion: *undeterministically*.

There will eventually be inconsistencies between what Yarn installed and what NSP thinks you have installed.
As the yarn.lock precisely states what is installed, the nsp-preprocessor-yarn transforms that into a format NSP understands.

## Silent
This preprocessor logs a short message, to indicate the processor has run, to let you know you're safe.
If you're parsing the output of the nsp run, and this message is annoying, you can disable the message by setting `--preprocess--silently`.

## Workspaces
This preprocessor supports [Yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/#toc-why-would-you-want-to-do-this) too: specify the `--lockfile` flag:

````bash
touch workspace/yarn.lock
cd workspace/my-package-1
nsp check --preprocessor yarn --lockfile ../yarn.lock
````
