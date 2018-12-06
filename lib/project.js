const inquirer = require('inquirer'),
    fs = require('fs'),
    spawn = require('cross-spawn'),
    path = require('path'),
    https = require('https');

async function getCrmSdkVersions() {
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
                    }).reverse();

                    resolve(versions);
                });
            }
        ).on('error', (e) => {
            reject(e);
        });
    });
}

async function getLatestJourneyTeamXrmVersion() {
    return new Promise((resolve, reject) => {
        https.get('https://api-v2v3search-0.nuget.org/query?q=packageid:JourneyTeam.Xrm',
            (response) => {
                let body = '';

                response.on('data', (d) => {
                    body += d;
                });

                response.on('end', () => {
                    const versions = JSON.parse(body).data[0].versions.map(v => {
                        return v.version;
                    });

                    resolve(versions.pop());
                });
            }
        ).on('error', (e) => {
            reject(e);
        });
    });
}

function prompt(type, versions) {
    console.log();
    console.log(`enter ${type} project configuration:`);
    console.log();

    const questions = [{
            type: 'list',
            name: 'version',
            message: 'select D365 SDK Version',
            choices: versions
        },
        {
            type: 'input',
            name: 'namespace',
            message: 'default namespace',
            default: path.basename(process.cwd())
        }
    ];

    return inquirer.prompt(questions);
}

function write(type, answers) {
    let destinationPath = process.cwd();
    let templatePath = path.resolve(__dirname, 'templates', 'create', 'project');

    console.log();
    console.log(`add ${type} project files`);
    console.log();

    // Write files
    fs.copyFileSync(path.resolve(templatePath, 'project.csproj'), path.resolve(destinationPath, `${answers.namespace}.csproj`));
    
    // Add namespace to csproj file
    require('replace-in-file').sync({
        files: path.resolve(destinationPath, `${answers.namespace}.csproj`),
        from: /<%= namespace %>/g,
        to: answers.namespace
    });

    // Write namespace to .d365rc file
    fs.writeFileSync(path.resolve(destinationPath, '.d365rc'), JSON.stringify({ namespace: answers.namespace }));
}

function install(answers, version) {
    console.log('install nuget packages');
    console.log();

    // Install nuget packages
    spawn.sync('dotnet', ['add', 'package', 'Microsoft.CrmSdk.Workflow', '-v', answers.version, '-n'], {
        cwd: process.cwd(),
        stdio: 'inherit'
    });

    spawn.sync('dotnet', ['add', 'package', 'JourneyTeam.Xrm', '-v', version, '-n'], {
        cwd: process.cwd(),
        stdio: 'inherit'
    });
    
    spawn.sync('dotnet', ['restore'], {
        cwd: process.cwd(),
        stdio: 'inherit'
    });
    
    // Sign assembly
    console.log();
    console.log("add key to sign assembly");

    const keyPath = path.resolve(process.cwd(), `${answers.namespace}.snk`);
    spawn.sync(path.resolve(__dirname, 'sn.exe'), ['-q', '-k', keyPath], { stdio: 'inherit'});
}

async function run(type) {
    console.log();
    console.log(`create ${type} project`);
    console.log();

    const versions = await getCrmSdkVersions();
    const version = await getLatestJourneyTeamXrmVersion();

    const answers = await prompt(type, versions);

    write(type, answers);

    install(answers, version);

    console.log();
    console.log(`${type} project created`);
    console.log();
}

module.exports = (...args) => {
    run(...args);
}