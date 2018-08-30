# d365-cli
|Build|NPM|Semantic-Release|
|-----|---|----------------|
|[![Build Status](https://travis-ci.org/derekfinlinson/d365-cli.png?branch=master)](https://travis-ci.org/derekfinlinson/d365-cli)|[![npm](https://img.shields.io/npm/v/d365-cli.svg?style=flat-square)](https://www.npmjs.com/package/d365-cli)|[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)|

Dynamics 365 CLI for scaffolding development projects

## Generators

* Web resource project scaffolding
  * [Webpack](https://webpack.js.org/) for bundling
  * [Babel](https://babeljs.io/) for polyfills and compiling ES2015+
  * Deploy from webpack emits using [node-webresource](https://github.com/derekfinlinson/node-webresource)
  * Unit tests using [xrm-mock](https://github.com/camelCaseDave/xrm-mock) and [Jest](https://jestjs.io/)
* Plugin project scaffolding
  * Coming soon
* Workflow project scaffolding
  * Coming soon

## Usage

```node
d365 create webresource

d365 add script Account

d365 add test-script Account

d365 add html index

d365 add css stylesheet
```