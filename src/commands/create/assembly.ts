import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as spawn from 'cross-spawn';
import { PluginAssembly } from '../models/pluginAssembly';
import prompts = require("prompts");

interface AssemblyConfig {
  sdkVersion: string;
  name: string;
  isolation: number,
  username: string;
  password: string;
  clientId: string;
  clientSecret: string;
  solution: string;
  server: string;
  authType: string;
  xrmVersion?: string;
}

export default async function assembly(type: string) {
  console.log(`\r\ncreate ${type} project`);

  const xrmVersion: Promise<string> = getLatestXrmVersion();
  const versions: string[] = await getSdkVersions();

  const config = (await getConfig(type, versions)) as AssemblyConfig;

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

function getConfig(type: string, versions: string[]): Promise<prompts.Answers<string>> {
  console.log(`\r\nenter ${type} project configuration:\r\n`);

  const questions: prompts.PromptObject[] = [
    {
      type: 'select',
      name: 'sdkVersion',
      message: 'select D365 SDK Version',
      choices: versions.map(v => ({ title: v, value: v }))
    },
    {
      type: 'text',
      name: 'name',
      message: 'project name',
      initial: path.basename(process.cwd())
    },
    {
      type: 'select',
      name: 'isolation',
      message: 'select isolation mode',
      choices: [
        {
          title: 'sandbox',
          value: 2
        },
        {
          title: 'none',
          value: 1
        }
      ]
    },
    {
      type: 'text',
      name: 'server',
      message: 'enter dynamics 365 url (https://org.crm.dynamics.com):'
    },
    {
      type: 'select',
      name: 'authType',
      message: 'select authentication method:',
      choices: [
        {
          title: 'username/password',
          value: 'user'
        },
        {
          title: 'client id/client secret',
          value: 'client'
        }
      ]
    },
    {
      type: (prev: any, values: any) => values.authType === 'user' ? 'text' : null,
      name: 'username',
      message: 'enter dynamics 365 username:'
    },
    {
      type: (prev: any, values: any) => values.authType === 'user' ? 'password' : null,
      name: 'password',
      message: 'enter dynamics 365 password:'
    },
    {
      type: (prev: any, values: any) => values.authType === 'client' ? 'password' : null,
      name: 'clientId',
      message: 'enter client id:'
    },
    {
      type: (prev: any, values: any) => values.authType === 'client' ? 'password' : null,
      name: 'clientSecret',
      message: 'enter client secret:'
    },
    {
      type: 'text',
      name: 'solution',
      message: 'dynamics 365 solution unique name:'
    }
  ];

  return prompts(questions);
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
    solution: config.solution
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
