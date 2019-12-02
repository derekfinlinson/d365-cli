import * as fs from 'fs';
import * as path from 'path';
import * as spawn from 'cross-spawn';
import prompts = require('prompts');

interface WebResourceConfig {
  username: string;
  password: string;
  clientId: string;
  clientSecret: string;
  solution: string;
  tenant: string;
  server: string;
  namespace: string;
  package: string;
  authType: string;
}

export default async function webresource() {
  const config = (await getConfig()) as WebResourceConfig;

  write(config);

  if (process.env.JEST_WORKER_ID === undefined) {
    install(config);
  }

  console.log();
  console.log('web resource project created');
  console.log();
}

function getConfig(): Promise<prompts.Answers<string>> {
  console.log();
  console.log('enter web resource project configuration:');
  console.log();

  const questions: prompts.PromptObject[] = [
    {
      type: 'text',
      name: 'namespace',
      message: 'namespace for form and ribbon scripts:'
    },
    {
      type: 'select',
      name: 'package',
      message: 'select package manager:',
      initial: 0,
      choices: [
        {
          title: 'NPM',
          value: 'npm'
        },
        {
          title: 'Yarn',
          value: 'yarn'
        }
      ]
    },
    {
      type: 'text',
      name: 'server',
      message: 'enter dynamics 365 url (https://org.crm.dynamics.com):'
    },
    {
      type: 'text',
      name: 'tenant',
      message: 'enter tenant (org.onmicrosoft.com):'
    },
    {
      type: 'select',
      name: 'authType',
      message: 'select authentication method:',
      choices: [
        {
          title: 'username/password',
          value: 'user'
        },
        {
          title: 'client id/client secret',
          value: 'client'
        }
      ]
    },
    {
      type: (prev: any, values: any) => values.authType === 'user' ? 'text' : null,
      name: 'username',
      message: 'enter dynamics 365 username:'
    },
    {
      type: (prev: any, values: any) => values.authType === 'user' ? 'password' : null,
      name: 'password',
      message: 'enter dynamics 365 password:'
    },
    {
      type: (prev: any, values: any) => values.authType === 'client' ? 'password' : null,
      name: 'clientId',
      message: 'enter client id:'
    },
    {
      type: (prev: any, values: any) => values.authType === 'client' ? 'password' : null,
      name: 'clientSecret',
      message: 'enter client secret:'
    },
    {
      type: 'text',
      name: 'solution',
      message: 'dynamics 365 solution unique name:'
    }
  ];

  return prompts(questions);
}

function write(config: WebResourceConfig) {
  let destinationPath = process.cwd();
  let templatePath = path.resolve(__dirname, 'templates', 'webresource');

  console.log();
  console.log('add web resource project files');
  console.log();

  // Write files
  if (config.package === 'npm') {
    fs.copyFileSync(path.resolve(templatePath, 'package.json'), path.resolve(destinationPath, 'package.json'));
  } else {
    fs.copyFileSync(path.resolve(templatePath, 'package.yarn.json'), path.resolve(destinationPath, 'package.json'));
  }

  fs.copyFileSync(path.resolve(templatePath, 'config.json'), path.resolve(destinationPath, 'config.json'));
  fs.copyFileSync(path.resolve(templatePath, 'tsconfig.json'), path.resolve(destinationPath, 'tsconfig.json'));
  fs.copyFileSync(path.resolve(templatePath, '.babelrc'), path.resolve(destinationPath, '.babelrc'));
  fs.copyFileSync(path.resolve(templatePath, 'browserslist'), path.resolve(destinationPath, 'browserslist'));

  // Add namespace to webpack config
  let content: string = fs.readFileSync(path.resolve(templatePath, 'webpack.config.js'), 'utf8');

  content = content.replace('<%= namespace %>', config.namespace);

  fs.writeFileSync(path.resolve(destinationPath, 'webpack.config.js'), content);

  // Write creds.json
  const credConfig = {
    server: config.server,
    username: config.username,
    password: config.password,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    solution: config.solution,
    tenant: config.tenant
  };

  fs.writeFileSync(path.resolve(destinationPath, 'creds.json'), JSON.stringify(credConfig));

  if (fs.existsSync(path.resolve(destinationPath, '.gitignore'))) {
    fs.appendFileSync(path.resolve(destinationPath, '.gitignore'), 'creds.json');
  }
}

function install(config: WebResourceConfig) {
  const command = config.package === 'npm' ? 'install' : 'add';

  // Run npm install
  const base = [
    command,
    '@types/xrm',
    'typescript',
    'ts-lint',
    'd365-common',
    'xrm-webapi',
    'webpack-event-plugin',
    'source-map-loader',
    'webpack',
    'babel-loader',
    'ts-loader',
    'webpack-cli',
    '@babel/core',
    '@babel/preset-env',
    '@babel/preset-typescript',
    'xrm-mock',
    'jest',
    'ts-jest',
    '@types/jest',
    '-D'
  ];

  const coreJs = [
    command,
    'core-js',
    'regenerator-runtime'
  ];

  console.log('install base packages');
  console.log();

  spawn.sync(config.package, base, {
    cwd: process.cwd(),
    stdio: 'inherit'
  });

  spawn.sync(config.package, coreJs, {
    cwd: process.cwd(),
    stdio: 'inherit'
  });

  console.log('initialize ts-jest');

  const jestConfig = ['ts-jest', 'config:init'];

  const jestCommand = config.package === 'npm' ? 'npx' : 'yarn';

  spawn.sync(jestCommand, jestConfig, {
    cwd: process.cwd(),
    stdio: 'inherit'
  });
}
