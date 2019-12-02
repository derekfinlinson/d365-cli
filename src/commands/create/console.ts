import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as spawn from 'cross-spawn';
import prompts = require("prompts");

interface ConsoleConfig {
    version: string;
    namespace: string;
}

export default async function consoleProject() {
    console.log('\r\ncreate console project\r\n');

    const versions = await getVersions();

    const config = (await getConfig(versions)) as ConsoleConfig;

    write(config);

    install(config);

    console.log('\r\nnconsole project created\r\n');
}

function getVersions(): Promise<string[]> {
    return new Promise((resolve, reject) => {
        https.get('https://api-v2v3search-0.nuget.org/query?q=packageid:Microsoft.CrmSdk.XrmTooling.CoreAssembly',
            (response) => {
                let body = '';

                response.on('data', (d) => {
                    body += d;
                });

                response.on('end', () => {
                    const versions = JSON.parse(body).data[0].versions.map((v: any) => {
                        return v.version;
                    }).reverse();;

                    resolve(versions);
                });
            }
        ).on('error', (e) => {
            reject(e);
        });
    });
}

function getConfig(versions: string[]): Promise<prompts.Answers<string>> {
    console.log();
    console.log('cnter console project configuration:');
    console.log();

    const questions: prompts.PromptObject[] = [{
            type: 'select',
            name: 'version',
            message: 'select D365 SDK Version',
            choices: versions.map(v => ({ title: v, value: v}))
        },
        {
            type: 'text',
            name: 'namespace',
            message: 'default namespace',
            initial: path.basename(process.cwd())
        }
    ];

    return prompts(questions);
}

function write(config: ConsoleConfig) {
    let destinationPath = process.cwd();
    let templatePath = path.resolve(__dirname, 'templates', 'console');

    console.log();
    console.log('add console project files');
    console.log();

    // Write files
    let content: string = fs.readFileSync(path.resolve(templatePath, 'console.csproj'), 'utf8');
    
    // Add namespace to csproj file
    content = content.replace(/<%= namespace %>/g, config.namespace);
    
    fs.writeFileSync(path.resolve(destinationPath, `${config.namespace}.csproj`), content);
}

function install(config: ConsoleConfig) {
    console.log('install nuget packages');
    console.log();

    // Install nuget packages
    spawn.sync('dotnet', ['add', 'package', 'Microsoft.CrmSdk.XrmTooling.CoreAssembly', '-v', config.version], {
        cwd: process.cwd(),
        stdio: 'inherit'
    });
    
    spawn.sync('dotnet', ['restore' ], {
        cwd: process.cwd(),
        stdio: 'inherit'
    });
}
