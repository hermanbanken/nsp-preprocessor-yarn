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
