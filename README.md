#DEPRECATED#

Use [powerapps-tools](https://github.com/powerapps-tools) instead

# d365-cli
|Build|NPM|
|-----|---|
|[![Build Status](https://derekfinlinson.visualstudio.com/GitHub/_apis/build/status/derekfinlinson.d365-cli)](https://derekfinlinson.visualstudio.com/GitHub/_build/latest?definitionId=5)|[![npm](https://img.shields.io/npm/v/d365-cli.svg?style=flat-square)](https://www.npmjs.com/package/d365-cli)|

Dynamics 365 CLI for scaffolding development projects

## Generators

* Web resource project scaffolding
  * [Typescript](https://www.typescriptlang.org/index.html) for JavaScript files
  * [Webpack](https://webpack.js.org/) for bundling
  * [Babel](https://babeljs.io/) for polyfills and compiling ES2015+  
  * Unit tests using [xrm-mock](https://github.com/camelCaseDave/xrm-mock) and [Jest](https://jestjs.io/)
  * Deploy web resources
* Plugin project scaffolding
  * Base plugin classes
  * No ILMerge needed
  * Deploy plugin assemblies and types
  * Deploy plugin steps
* Workflow project scaffolding
  * Workflow activity base class
  * No ILMerge needed
  * Deploy workflow assemblies and types
* Console application project scaffolding

## Usage

### Installation

```node
#npm
npm install -g d365-cli

#yarn
yarn global add d365-cli
```

### Create

```node
d365 create webresource

d365 create plugin

d365 create workflow

d365 create console
```

### Add

```node
d365 add script Account

d365 add test-script Account

d365 add html index

d365 add css stylesheet

d365 add plugin AccountCreate

d365 add workflow SomeActivity
```

### Deploy

To deploy, sign in [here](https://login.microsoftonline.com/common/oauth2/authorize?response_type=code&client_id=c67c746f-9745-46eb-83bb-5742263736b7&redirect_uri=https://github.com/derekfinlinson/d365-cli) to grant access to your Dynamics 365 organization.

Deployment configuration is stored in config.json. Authentication information is stored in creds.json. The "create" and "add" commands will generate and updates these files for you.

```node
d365 deploy webresource

d365 deploy plugin

d365 deploy workflow
```

## Contributions

Contributions are welcome. To commit changes, stage them then run ```npm run commit ``` to commit. This will format the commit so [semantic-release](https://semantic-release.gitbook.io/semantic-release/) can select the correct version number.
