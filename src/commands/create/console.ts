import { prompt } from 'inquirer';
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as spawn from 'cross-spawn';

interface ConsoleConfig {
    version: string;
    namespace: string;
}

export default async function consoleProject() {
    console.log();
    console.log('create console project');
    console.log();

    const versions = await getVersions();

    const config: ConsoleConfig = await getConfig(versions);

    write(config);

    install(config);

    console.log();
    console.log("console project created");
    console.log();
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
                    });

                    resolve(versions);
                });
            }
        ).on('error', (e) => {
            reject(e);
        });
    });
}

function getConfig(versions: string[]): Promise<ConsoleConfig> {
    console.log();
    console.log('cnter console project configuration:');
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

    return prompt(questions);
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
