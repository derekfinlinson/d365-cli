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
  * Unit tests using [xrm-mock](https://github.com/camelCaseDave/xrm-mock) and [Jest](https://jestjs.io/)
* Plugin project scaffolding
  * Base plugin classes
  * No ILMerge needed
* Workflow project scaffolding
  * Workflow activity base class
  * No ILMerge needed
* Console application project scaffolding
* Deploy
  * Deploy web resources

## Usage

```node
npx d365-cli create webresource

npx d365-cli create plugin

npx d365-cli create workflow

npx d365-cli create console

npx d365-cli add script Account

npx d365-cli add test-script Account

npx d365-cli add html index

npx d365-cli add css stylesheet

npx d365-cli add plugin AccountCreate

npx d365-cli add workflow SomeActivity

npx d365-cli deploy webresource
```
## Deploying

To deploy, sign in [here](https://login.microsoftonline.com/common/oauth2/authorize?response_type=code&client_id=c67c746f-9745-46eb-83bb-5742263736b7&redirect_uri=https://github.com/derekfinlinson/d365-cli) to grant access to your Dynamics 365 organization.

## Contributions

Contributions are welcome. To commit changes, stage them then run ```npm run commit ``` to commit. This will format the commit so [semantic-release](https://semantic-release.gitbook.io/semantic-release/) can select the correct version number.
