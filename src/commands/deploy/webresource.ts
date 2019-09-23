import { parseGuid, WebApiConfig, retrieveMultiple, createWithReturnData, update, unboundAction } from 'xrm-webapi/dist/xrm-webapi-node';

import { AuthenticationContext, TokenResponse } from 'adal-node';

import * as fs from 'fs';
import * as path from 'path';

export interface DeployCredentials {
  tenant: string;
  clientId?: string;
  clientSecret?: string;
  server: string;
  username?: string;
  password?: string;
  solution?: string;
}

export interface DeployConfig {
  webResources: WebResource[];
}

export interface WebResource {
  displayname?: string;
  name?: string;
  type?: string;
  content?: string;
  path?: string;
  webresourcetype?: number;
}

let apiConfig: WebApiConfig;

export async function webresource(files?: string) {
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

  // retrieve assets from CRM then create/update
  const publishXml = await deploy(config, creds.solution, files);

  // publish resources
  if (publishXml != '') {
    try {
      await publish(publishXml);
    } catch (error) {
      console.error(error.message);
      return;
    }
  }

  console.log("\r\nDeployed web resources\r\n");
}

function getWebResourceType(type: string): number {
  switch (type) {
    case "HTML":
      return 1;
    case "CSS":
      return 2;
    case "JavaScript":
      return 3;
    case "XML":
      return 4;
    case "PNG":
      return 5;
    case "JPG":
      return 6;
    case "GIF":
      return 7;
    case "XAP":
      return 8;
    case "XSL":
      return 9;
    case "ICO":
      return 10;
    case "SVG":
      return 11;
    case "RESX":
      return 12;
  }
}

function authenticate(creds: DeployCredentials): Promise<string> {
  return new Promise((resolve, reject) => {
    // authenticate
    const authorityHostUrl: string = `https://login.windows.net/${creds.tenant}`;
    const context = new AuthenticationContext(authorityHostUrl);
    const clientId: string = creds.clientId || "c67c746f-9745-46eb-83bb-5742263736b7";

    // use client id/secret auth
    if (creds.clientSecret != null && creds.clientSecret !== "") {
      context.acquireTokenWithClientCredentials(creds.server, clientId, creds.clientSecret,
        (ex: Error, token: TokenResponse) => {
          if (ex) {
            reject(ex);
          } else {
            resolve(token.accessToken);
          }
        }
      );
      // username/password authentication
    } else {
      context.acquireTokenWithUsernamePassword(creds.server, creds.username, creds.password, clientId,
        (ex: Error, token: TokenResponse) => {
          if (ex) {
            reject(ex);
          } else {
            resolve(token.accessToken);
          }
        }
      );
    }
  });
}

async function deploy(config: DeployConfig, solution?: string, files?: string): Promise<string> {
  const publishXml: string[] = [];
  let resources: WebResource[] = config.webResources;

  if (files != undefined) {
    resources = files.split(',').map(file => {
      const resource = config.webResources.filter(r => r.path.endsWith(file));

      if (resource.length === 0) {
        console.error(`Web resource ${file} is not configured`);
        return null;
      } else {
        return resource[0];
      }
    }).filter(r => r != null);
  }

  const promises = resources.map(async resource => {
    const resourceId = await retrieveResource(resource.name);

    const fileContent = fs.readFileSync(resource.path, 'utf8');
    const content = Buffer.from(fileContent).toString("base64");

    if (resourceId != undefined) {
      try {
        const updated = await updateResource(resourceId, resource, content);

        publishXml.push(updated);
      } catch (error) {
        console.error(`Failed to update resource: ${error.message}`);
        return;
      }
    } else {
      try {
        const id = await createResource(resource, content);

        if (solution != undefined) {
          await addToSolution(id, solution)
        }
      } catch (error) {
        console.error(`Failed to create resource: ${error.message}`);
        return;
      }
    }
  });

  await Promise.all(promises);

  return publishXml.join('');
}

async function retrieveResource(name: string): Promise<string> {
  const options: string = `$select=webresourceid&$filter=name eq '${name}'`;

  const result = await retrieveMultiple(apiConfig, "webresourceset", options);

  return result.value.length > 0 ? result.value[0].webresourceid : undefined;
}

async function createResource(resource: WebResource, content: string): Promise<string> {
  console.log(`Create web resource ${resource.name}`);

  const webResource: WebResource = {
    webresourcetype: getWebResourceType(resource.type),
    name: resource.name,
    displayname: resource.displayname || resource.name,
    content: content
  };

  const result = await createWithReturnData(apiConfig, "webresourceset", webResource, "$select=webresourceid");

  return result.webresourceid;
}

async function updateResource(id: string, resource: WebResource, content: string) {
  console.log(`Update web resource ${resource.name}`);

  const webResource: WebResource = {
    content: content
  };

  await update(apiConfig, "webresourceset", parseGuid(id), webResource);

  return `<webresource>{${id}}</webresource>`;
}

async function addToSolution(id: string, solution: string) {
  const data: any = {
    ComponentId: id,
    ComponentType: 61,
    SolutionUniqueName: solution,
    AddRequiredComponents: false,
    IncludedComponentSettingsValues: null
  };

  await unboundAction(apiConfig, 'AddSolutionComponent', data);
}

async function publish(publishXml: string) {
  const data: any = {
    ParameterXml: `<importexportxml><webresources>${publishXml}</webresources></importexportxml>`
  };

  await unboundAction(apiConfig, 'PublishXml', data);
}
