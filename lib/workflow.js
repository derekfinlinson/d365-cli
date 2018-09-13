const inquirer = require('inquirer'),    
    fs = require('fs'),
    spawn = require('cross-spawn'),
    path = require('path'),
    https = require('https');

async function getVersions() {
    return new Promise((resolve, reject) => {
        https.get('https://api-v2v3search-0.nuget.org/query?q=packageid:Microsoft.CrmSdk.Workflow',
        (response) => {
            response.on('data', (d) => {
                const versions = d.data[0].versions.map(v => {
                    return v.version;
                });

                resolve(versions);
            });
        }).on('error', (e) => {
            reject(e);
        });
    });
}

function prompt(versions) {
    console.log();
    console.log('Enter workflow activity project configuration:');
    console.log();

    const questions = [
        {
            type: 'list',
            name: 'version',
            message: 'Select D365 SDK Version',
            choices: versions
        },
        {
            type: 'input',
            name: 'namespace',
            message: 'Default namespace'
        },
        {
            type: 'confirm',
            name: 'test',
            message: 'Add test project?'
        },
        {
            type: 'list',
            name: 'testFramework',
            message: 'Select unit test framework',
            choices: [
                {
                    name: 'xUnit',
                    value: 'xunit'
                },
                {
                    name: 'NUnit',
                    value: 'nunit'
                },
                {
                    name: 'MSTest',
                    value: 'mstest'
                }
            ],
            when: (answers) => {
                return answers.test;
            }
        }
    ];

    return inquirer.prompt(questions);
}

function write(answers) {
    let destinationPath = process.cwd();
    let templatePath = path.resolve(__dirname, 'templates', 'create', 'plugin');
}

async function run() {
    const versions = await getVersions();

    const answers = await prompt(versions);

    write(answers);
}

module.exports = (...args) => {
    run(...args);
}