import { prompt } from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import * as spawn from 'cross-spawn';

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
    const config = await getConfig();

    write(config);

    if (process.env.JEST_WORKER_ID === undefined) {
        install(config);
    }

    console.log();
    console.log('web resource project created');
    console.log();
}

function getConfig(): Promise<WebResourceConfig> {
    console.log();
    console.log('enter web resource project configuration:');
    console.log();
    
    const questions = [
        {
            type: 'input',
            name: 'namespace',
            message: 'namespace for form and ribbon scripts:'
        },
        {
            type: 'list',
            name: 'package',
            message: 'select package manager:',
            default: 'npm',
            choices: [
                {
                    name: 'NPM',
                    value: 'npm'
                },
                {
                    name: 'Yarn',
                    value: 'yarn'
                }
            ]
        },
        {
            type: 'input',
            name: 'server',
            message: 'enter dynamics 365 url (https://org.crm.dynamics.com):'
        },
        {
            type: 'input',
            name: 'tenant',
            message: 'enter tenant (org.onmicrosoft.com):'
        },
        {
            type: 'list',
            name: 'authType',
            message: 'select authentication method:',
            choices: [
                {
                    name: 'username/password',
                    value: 'user'
                },
                {
                    name: 'client id/client secret',
                    value: 'client'
                }
            ]
        },
        {
            type: 'input',
            name: 'username',
            message: 'enter dynamics 365 username:',
            when: (config: WebResourceConfig) => {
                return config.authType === 'user'
            }
        },
        {
            type: 'password',
            name: 'password',
            message: 'enter dynamics 365 password:',
            when: (config: WebResourceConfig) => {
                return config.authType === 'user'
            }
        },
        {
            type: 'password',
            name: 'clientId',
            message: 'enter client id:',
            when: (config: WebResourceConfig) => {
                return config.authType === 'client'
            }
        },
        {
            type: 'password',
            name: 'clientSecret',
            message: 'enter client secret:',
            when: (config: WebResourceConfig) => {
                return config.authType === 'client'
            }
        },
        {
            type: 'input',
            name: 'solution',
            message: 'dynamics 365 solution unique name:'
        }
    ];

    return prompt(questions);
}
  
function write (config: WebResourceConfig) {
    let destinationPath = process.cwd();
    let templatePath = path.resolve(__dirname, 'templates', 'webresource');

    console.log();
    console.log('add web resource project files');
    console.log();

    // Write files
    fs.copyFileSync(path.resolve(templatePath, 'package.json'), path.resolve(destinationPath, 'package.json'));
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
}

function install(config: WebResourceConfig) {
    const command = config.package === 'npm' ? 'install' : 'add';

    // Run npm install
    const base = [
        command,
        '@types/xrm',
        'typescript',
        'ts-lint',
        'xrm-webapi',
        'jest',
        'ts-jest',
        'xrm-mock',
        '-D'
    ];

    const webpack = [
        command,
        'node-webresource',
        'webpack-event-plugin',
        'source-map-loader',
        'webpack',
        'webpack-cli',
        'babel-loader',
        'ts-loader',
        'acorn',
        '-D'
    ];

    const babel = [
        command,        
        '@babel/core',
        '@babel/preset-env',
        '@babel/preset-typescript',
        '-D'
    ];

    const babelPolyfill = [
        command,
        '@babel/polyfill'
    ];

    console.log('install base packages');
    console.log();

    spawn.sync(config.package, base, {
        cwd: process.cwd(),
        stdio: 'inherit'
    });

    console.log('install webpack');
    console.log();

    spawn.sync(config.package, webpack, {
        cwd: process.cwd(),
        stdio: 'inherit'
    });

    console.log('install babel');
    console.log();

    spawn.sync(config.package, babel, {
        cwd: process.cwd(),
        stdio: 'inherit'
    });

    spawn.sync(config.package, babelPolyfill, {
        cwd: process.cwd(),
        stdio: 'inherit'
    });
}

