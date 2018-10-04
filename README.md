# d365-cli
|Build|NPM|Semantic-Release|
|-----|---|----------------|
|[![Build Status](https://derekfinlinson.visualstudio.com/GitHub/_apis/build/status/derekfinlinson.d365-cli)](https://derekfinlinson.visualstudio.com/GitHub/_build/latest?definitionId=5)|[![npm](https://img.shields.io/npm/v/d365-cli.svg?style=flat-square)](https://www.npmjs.com/package/d365-cli)|[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)|

Dynamics 365 CLI for scaffolding development projects

## Generators

* Web resource project scaffolding
  * [Typescript](https://www.typescriptlang.org/index.html) for JavaScript files
  * [Webpack](https://webpack.js.org/) for bundling
  * [Babel](https://babeljs.io/) for polyfills and compiling ES2015+
  * Deploy from webpack emits using [node-webresource](https://github.com/derekfinlinson/node-webresource)
  * Unit tests using [xrm-mock](https://github.com/camelCaseDave/xrm-mock) and [Jest](https://jestjs.io/)
* Plugin project scaffolding
  * Base plugin classes
  * No ILMerge needed
* Workflow project scaffolding
  * Workflow activity base class
  * No ILMerge needed

## Usage

```node
d365 create webresource

d365 create plugin

d365 create workflow

d365 add script Account

d365 add test-script Account

d365 add html index

d365 add css stylesheet

d365 add plugin AccountCreate

d365 add workflow SomeActivity
```
