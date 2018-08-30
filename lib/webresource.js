const inquirer = require('inquirer'),    
    fs = require('fs'),
    spawn = require('cross-spawn'),
    path = require('path');

function prompt() {
    console.log();
    console.log('Enter web resource project configuration:');
    console.log();
    
    const questions = [
        {
            type: 'input',
            name: 'namespace',
            message: 'Namespace for form and ribbon scripts:'
        },
        {
            type: 'confirm',
            name: 'git',
            message: 'Include .gitignore file?',
            defaut: true
        },
        {
            type: 'list',
            name: 'package',
            message: 'Select package manager:',
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
            message: 'Enter Dynamics 365 URL (https://org.crm.dynamics.com):'
        },
        {
            type: 'input',
            name: 'tenant',
            message: 'Enter tenant (org.onmicrosoft.com):'
        },
        {
            type: 'list',
            name: 'authType',
            message: 'Select authentication method:',
            choices: [
                {
                    name: 'Username/Password',
                    value: 'user'
                },
                {
                    name: 'Client ID/Client Secret',
                    value: 'client'
                }
            ]
        },
        {
            type: 'input',
            name: 'username',
            message: 'Enter Dynamics 365 username:',
            when: (answers) => {
                return answers.authType === 'user'
            }
        },
        {
            type: 'password',
            name: 'password',
            message: 'Enter Dynamics 365 password:',
            when: (answers) => {
                return answers.authType === 'user'
            }
        },
        {
            type: 'password',
            name: 'clientid',
            message: 'Enter Client ID:',
            when: (answers) => {
                return answers.authType === 'client'
            }
        },
        {
            type: 'password',
            name: 'clientsecret',
            message: 'Enter Client Secret:',
            when: (answers) => {
                return answers.authType === 'client'
            }
        },
        {
            type: 'input',
            name: 'solution',
            message: 'Dynamics 365 solution unique name:'
        }
    ];

    return inquirer.prompt(questions);
}
  
function write (answers) {
    let destinationPath = process.cwd();
    let templatePath = path.resolve(__dirname, 'templates', 'create', 'webresource');

    console.log();
    console.log('Add web resource project files');
    console.log();

    // Write files
    fs.copyFileSync(path.resolve(templatePath, 'package.json'), path.resolve(destinationPath, 'package.json'));
    fs.copyFileSync(path.resolve(templatePath, 'config.json'), path.resolve(destinationPath, 'config.json'));
    fs.copyFileSync(path.resolve(templatePath, 'tsconfig.json'), path.resolve(destinationPath, 'tsconfig.json'));
    fs.copyFileSync(path.resolve(templatePath, 'webpack.config.js'), path.resolve(destinationPath, 'webpack.config.js'));

    // Add namespace to webpack config
    require('replace-in-file').sync({
        files: path.resolve(destinationPath, 'webpack.config.js'),
        from: '<%= namespace %>',
        to: answers.namespace
    });

    // Write creds.json
    const credConfig = {
        server: answers.server,
        username: answers.username,
        password: answers.password,
        clientId: answers.clientId,
        clientSecret: answers.clientSecret,
        solution: answers.solution,
        tenant: answers.tenant
    };

    fs.writeFileSync(path.resolve(destinationPath, 'creds.json'), JSON.stringify(credConfig));

    if (answers.git) {
        fs.copyFileSync(path.resolve(templatePath, '.gitignore'), path.resolve(destinationPath, '.gitignore'));
    }
}

function install(package) {
    // Run npm install
    const install = [
        package === 'npm' ? 'install' : 'add',
        '@types/xrm',
        'node-webresource',
        'webpack-event-plugin',
        'source-map-loader',
        'ts-loader',
        'typescript',
        'webpack',
        'webpack-cli',
        'xrm-webapi',
        'xrm-mock',
        '@babel/polyfill',
        '@babel/core',
        '@babel/preset-env',
        'babel-loader@^8.0.0-beta',
        'jest',
        'ts-jest',
        '-D'
    ];

    console.log('Install base npm packages');
    console.log();

    if (package === 'npm') {
        spawn.sync('npm', install, { cwd: process.cwd(), stdio: 'inherit' });
    } else {
        spawn.sync('yarn', install, { cwd: process.cwd(), stdio: 'inherit' });
    }
}

async function run() {
    const answers = await prompt();

    write(answers);
    install(answers.package);

    console.log();
    console.log("Web resource project created");
    console.log();
}   

module.exports = (...args) => {
    run(...args);
}
