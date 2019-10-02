import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

import { DeployCredentials, authenticate } from '../models/shared';
import { WebApiConfig } from 'xrm-webapi/dist/xrm-webapi-node';
import { PluginAssembly, deployAssembly } from '../models/pluginAssembly';

export async function assembly(type: string) {
  const configFile = glob.sync(`**/config.json`);
  const credsFile = glob.sync('**/creds.json');

  if (configFile.length === 0) {
    console.error('unable to find config.json file');
    return;
  } else if (credsFile.length === 0) {
    console.error('unable to find creds.json file');
    return;
  }

  const currentPath = path.dirname(configFile[0]);

  const config: PluginAssembly = JSON.parse(fs.readFileSync(path.resolve(currentPath, 'config.json'), 'utf8'));
  const creds: DeployCredentials = JSON.parse(fs.readFileSync(path.resolve(currentPath, 'creds.json'), 'utf8'));

  let apiConfig: WebApiConfig;

  try {
    const token = await authenticate(creds);

    apiConfig = new WebApiConfig("8.2", token, creds.server);
  } catch (error) {
    console.error(`authentication failure: ${error}`);
    return;
  }

  console.log(`\r\ndeploy ${type}`);

  try {
    await deployAssembly(config, type, creds.solution, apiConfig);
  } catch (error) {
    console.error(error.message);
    return;
  }

  console.log(`deployed ${type} ${config.name}\r\n`)
}
