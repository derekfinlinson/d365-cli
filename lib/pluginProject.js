const inquirer = require('inquirer'),
    fs = require('fs'),
    spawn = require('cross-spawn'),
    path = require('path'),
    https = require('https');

async function getVersions() {
    return new Promise((resolve, reject) => {
        https.get('https://api-v2v3search-0.nuget.org/query?q=packageid:Microsoft.CrmSdk.Workflow',
            (response) => {
                let body = '';

                response.on('data', (d) => {
                    body += d;
                });

                response.on('end', () => {
                    const versions = JSON.parse(body).data[0].versions.map(v => {
                        return v.version;
                    });

                    resolve(versions);
                });
            }
        ).on('error', (e) => {
            reject(e);
        });
    });
}

function prompt(versions) {
    console.log();
    console.log('Enter plugin project configuration:');
    console.log();

    const questions = [{
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
            choices: [{
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

    console.log();
    console.log('Add plugin project files');
    console.log();

    // Write files
    fs.copyFileSync(path.resolve(templatePath, 'plugin.csproj'), path.resolve(destinationPath, `${answers.namespace}.csproj`));

    // Add namespace to csproj file
    require('replace-in-file').sync({
        files: path.resolve(destinationPath, `${answers.namespace}.csproj`),
        from: /<%= namespace %>/g,
        to: answers.namespace
    });
}

function install(answers) {
    console.log();
    console.log('Adding nuget packages');
    console.log();

    // Install nuget packages
    spawn.sync('dotnet', ['add', 'package', 'Microsoft.CrmSdk.Workflow', '-v', answers.version], {
        cwd: process.cwd(),
        stdio: 'inherit'
    });
    spawn.sync('dotnet', [ 'add', 'package', 'ILRepack' ], {
        cwd: process.cwd(),
        stdio: 'inherit'
    });
    spawn.sync('dotnet', [ 'add', 'package', 'JourneyTeam.Xrm' ], {
        cwd: process.cwd(),
        stdio: 'inherit'
    });
    spawn.sync('dotnet', ['restore' ], {
        cwd: process.cwd(),
        stdio: 'inherit'
    });
}

async function run() {
    const versions = await getVersions();

    const answers = await prompt(versions);

    write(answers);

    install(answers);

    console.log();
    console.log("Plugin project created");
    console.log();
}

module.exports = (...args) => {
    run(...args);
}