import { prompt, QuestionCollection } from 'inquirer';
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as spawn from 'cross-spawn';

interface AssemblyConfig {
    sdkVersion: string;
    namespace: string;
    username: string;
    password: string;
    clientId: string;
    clientSecret: string;
    solution: string;
    tenant: string;
    server: string;
    authType: string;
    xrmVersion?: string;
}

export default async function assembly(type: string) {
    console.log();
    console.log(`create ${type} project`);
    console.log();

    const xrmVersion: Promise<string> = getLatestXrmVersion();
    const versions: string[] = await getSdkVersions();

    const config: AssemblyConfig = await getConfig(type, versions);

    config.xrmVersion = await xrmVersion;

    write(type, config);

    install(config);

    console.log();
    console.log(`${type} project created`);
    console.log();
}

function getSdkVersions(): Promise<string[]> {
    return new Promise((resolve, reject) => {
        https.get('https://api-v2v3search-0.nuget.org/query?q=packageid:Microsoft.CrmSdk.Workflow',
            (response) => {
                let body = '';

                response.on('data', (d) => {
                    body += d;
                });

                response.on('end', () => {
                    const versions = JSON.parse(body).data[0].versions.map((v: any) => {
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

function getLatestXrmVersion(): Promise<string> {
    return new Promise((resolve, reject) => {
        https.get('https://api-v2v3search-0.nuget.org/query?q=packageid:JourneyTeam.Xrm',
            (response) => {
                let body = '';

                response.on('data', (d) => {
                    body += d;
                });

                response.on('end', () => {
                    const versions = JSON.parse(body).data[0].versions.map((v: any) => {
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

function getConfig(type: string, versions: string[]): Promise<AssemblyConfig> {
    console.log();
    console.log(`enter ${type} project configuration:`);
    console.log();

    const questions: QuestionCollection<AssemblyConfig> = [
        {
            type: 'list',
            name: 'sdkVersion',
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

function write(type: string, config: AssemblyConfig) {
    let destinationPath = process.cwd();
    let templatePath = path.resolve(__dirname, 'templates', 'assembly');

    console.log();
    console.log(`add ${type} project files`);
    console.log();

    // Write files
    let content: string = fs.readFileSync(path.resolve(templatePath, 'assembly.csproj'), 'utf8');

    content = content.replace(/<%= namespace %>/g, config.namespace);

    fs.writeFileSync(path.resolve(destinationPath, `${config.namespace}.csproj`), content);

    // Write namespace to .d365rc file
    fs.writeFileSync(path.resolve(destinationPath, '.d365rc'), JSON.stringify({ namespace: config.namespace }));

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

function install(config: AssemblyConfig) {
    console.log('install nuget packages');
    console.log();

    // Install nuget packages
    spawn.sync('dotnet', ['add', 'package', 'Microsoft.CrmSdk.Workflow', '-v', config.sdkVersion, '-n'], {
        cwd: process.cwd(),
        stdio: 'inherit'
    });

    spawn.sync('dotnet', ['add', 'package', 'JourneyTeam.Xrm', '-v', config.xrmVersion, '-n'], {
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

    const keyPath = path.resolve(process.cwd(), `${config.namespace}.snk`);
    spawn.sync(path.resolve(__dirname, 'sn.exe'), ['-q', '-k', keyPath], { stdio: 'inherit' });
}
