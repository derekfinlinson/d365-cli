const inquirer = require('inquirer'),
    fs = require('fs'),
    spawn = require('cross-spawn'),
    path = require('path'),
    https = require('https');

async function getVersions() {
    return new Promise((resolve, reject) => {
        https.get('https://api-v2v3search-0.nuget.org/query?q=packageid:Microsoft.CrmSdk.XrmTooling.CoreAssembly',
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
    console.log('Enter console project configuration:');
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
            message: 'Default namespace',
            default: path.basename(process.cwd())
        }
    ];

    return inquirer.prompt(questions);
}

function write(answers) {
    let destinationPath = process.cwd();
    let templatePath = path.resolve(__dirname, 'templates', 'create', 'console');

    console.log();
    console.log('Add console project files');
    console.log();

    // Write files
    fs.copyFileSync(path.resolve(templatePath, 'console.csproj'), path.resolve(destinationPath, `${answers.namespace}.csproj`));

    // Add namespace to csproj file
    require('replace-in-file').sync({
        files: path.resolve(destinationPath, 'Program.cs'),
        from: /<%= namespace %>/g,
        to: answers.namespace
    });
}

function install(answers) {
    console.log('Adding nuget packages');
    console.log();

    // Install nuget packages
    spawn.sync('dotnet', ['add', 'package', 'Microsoft.CrmSdk.XrmTooling.CoreAssembly', '-v', answers.version], {
        cwd: process.cwd(),
        stdio: 'inherit'
    });
    
    spawn.sync('dotnet', ['restore' ], {
        cwd: process.cwd(),
        stdio: 'inherit'
    });
}

async function run() {
    console.log();
    console.log('Create console project');
    console.log();

    const versions = await getVersions();

    const answers = await prompt(versions);

    write(answers);

    install(answers);

    console.log();
    console.log("Console project created");
    console.log();
}

module.exports = (...args) => {
    run(...args);
}