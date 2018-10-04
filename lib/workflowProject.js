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
            message: 'Default namespace',
            default: path.basename(process.cwd())
        }
    ];

    return inquirer.prompt(questions);
}

function write(answers) {
    let destinationPath = process.cwd();
    let templatePath = path.resolve(__dirname, 'templates', 'create', 'workflow');

    console.log();
    console.log('Add workflow project files');
    console.log();

    // Write files
    fs.copyFileSync(path.resolve(templatePath, 'workflow.csproj'), path.resolve(destinationPath, `${answers.namespace}.csproj`));

    // Add WorkflowActivity directory
    if (!fs.existsSync(path.resolve(destinationPath, 'WorkflowActivity'))) {
        fs.mkdirSync(path.resolve(destinationPath, 'WorkflowActivity'));
    }

    // Write base workflow files
    fs.copyFileSync(path.resolve(templatePath, 'BaseWorkflowActivity.cs'), path.resolve(destinationPath, 'WorkflowActivity', 'BaseWorkflowActivity.cs'));
    fs.copyFileSync(path.resolve(templatePath, 'LocalWorkflowContext.cs'), path.resolve(destinationPath, 'WorkflowActivity', 'LocalWorkflowContext.cs'));

    // Add namespace to csproj file
    require('replace-in-file').sync({
        files: path.resolve(destinationPath, `${answers.namespace}.csproj`),
        from: /<%= namespace %>/g,
        to: answers.namespace
    });

    // Write namespace to .d365rc file
    fs.writeFileSync(path.resolve(destinationPath, '.d365rc'), JSON.stringify({ namespace: answers.namespace }));

    // Sign assembly
    console.log();
    console.log("Add key to sign assembly");

    const keyPath = path.resolve(process.cwd(), `${answers.namespace}.snk`);
    spawn.sync(path.resolve(__dirname, 'sn.exe'), ['-q', '-k', keyPath], { stdio: 'inherit'});
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
    spawn.sync('dotnet', ['restore'], {
        cwd: process.cwd(),
        stdio: 'inherit'
    });
}

async function run() {
    console.log();
    console.log('Create workflow activity project');
    console.log();

    const versions = await getVersions();

    const answers = await prompt(versions);

    write(answers);

    install(answers);

    console.log();
    console.log("Workflow project created");
    console.log();
}

module.exports = (...args) => {
    run(...args);
}