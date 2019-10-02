import { prompt, QuestionCollection } from 'inquirer';
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as spawn from 'cross-spawn';
import { PluginAssembly } from '../models/pluginAssembly';

interface AssemblyConfig {
    sdkVersion: string;
    name: string;
    isolation: number,
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
    console.log(`\r\ncreate ${type} project`);

    const xrmVersion: Promise<string> = getLatestXrmVersion();
    const versions: string[] = await getSdkVersions();

    const config: AssemblyConfig = await getConfig(type, versions);

    config.xrmVersion = await xrmVersion;

    write(type, config);

    install(config);

    console.log(`\r\n${type} project created`);
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
    console.log(`\r\nenter ${type} project configuration:\r\n`);

    const questions: QuestionCollection<AssemblyConfig> = [
        {
            type: 'list',
            name: 'sdkVersion',
            message: 'select D365 SDK Version',
            choices: versions
        },
        {
            type: 'input',
            name: 'name',
            message: 'project name',
            default: path.basename(process.cwd())
        },
        {
          type: 'list',
          name: 'isolation',
          message: 'select isolation mode',
          choices: [
            {
              name: 'sandbox',
              value: 2
            },
            {
              name: 'none',
              value: 1
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
          when: (config: AssemblyConfig) => {
              return config.authType === 'user'
          }
      },
      {
          type: 'password',
          name: 'password',
          message: 'enter dynamics 365 password:',
          when: (config: AssemblyConfig) => {
              return config.authType === 'user'
          }
      },
      {
          type: 'password',
          name: 'clientId',
          message: 'enter client id:',
          when: (config: AssemblyConfig) => {
              return config.authType === 'client'
          }
      },
      {
          type: 'password',
          name: 'clientSecret',
          message: 'enter client secret:',
          when: (config: AssemblyConfig) => {
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

function write(type: string, config: AssemblyConfig) {
    let destinationPath = process.cwd();
    let templatePath = path.resolve(__dirname, 'templates', 'assembly');

    console.log(`\r\nadd ${type} project files`);

    // Write files
    const assembly: PluginAssembly = {
      name: config.name,
      isolationmode: config.isolation,
      version: '1.0.0.0',
      publickeytoken: `${config.name}.snk`,
      types: [
      ]
    };

    fs.writeFileSync(path.resolve(destinationPath, 'config.json'), JSON.stringify(assembly));

    let content: string = fs.readFileSync(path.resolve(templatePath, 'assembly.csproj'), 'utf8');

    content = content.replace(/<%= namespace %>/g, config.name);

    fs.writeFileSync(path.resolve(destinationPath, `${config.name}.csproj`), content);

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

    if (fs.existsSync(path.resolve(destinationPath, '.gitignore'))) {
      fs.appendFileSync(path.resolve(destinationPath, '.gitignore'), 'creds.json');
    }
}

function install(config: AssemblyConfig) {
    console.log('install nuget packages');

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
    console.log('\r\nadd key to sign assembly');

    const keyPath = path.resolve(process.cwd(), `${config.name}.snk`);
    spawn.sync(path.resolve(__dirname, 'sn.exe'), ['-q', '-k', keyPath], { stdio: 'inherit' });
}
