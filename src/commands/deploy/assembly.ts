import * as fs from 'fs';
import * as path from 'path';
import { DeployCredentials, authenticate } from './authentication';
import { WebApiConfig } from 'xrm-webapi/dist/xrm-webapi-node';

interface DeployConfig {
  assembly: string;
  plugins: Plugin[];
}

interface Plugin {
  name: string;
  steps: Step[];
}

interface Step {

}

let apiConfig: WebApiConfig;

export async function assembly(type: string) {
  console.log("Under development");

  return;
  
  const currentPath = process.cwd();

  if (!fs.existsSync(path.resolve(currentPath, 'config.json'))) {
    console.error('Unable to find config.json file');
    return;
  } else if (!fs.existsSync(path.resolve(currentPath, 'creds.json'))) {
    console.error('Unable to find creds.json file');
    return;
  }

  const config: DeployConfig = JSON.parse(fs.readFileSync(path.resolve(currentPath, 'config.json'), 'utf8'));
  const creds: DeployCredentials = JSON.parse(fs.readFileSync(path.resolve(currentPath, 'creds.json'), 'utf8'));

  try {
    const token = await authenticate(creds);

    apiConfig = new WebApiConfig("8.2", token, creds.server);
  } catch (error) {
    console.error(`Authentication failure: ${error}`);
    return;
  }

  console.log("\r\nDeploy web resources\r\n");
}
