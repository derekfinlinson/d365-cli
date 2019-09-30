import { parseGuid, WebApiConfig, retrieveMultiple, createWithReturnData, update, unboundAction } from 'xrm-webapi/dist/xrm-webapi-node';
import * as fs from 'fs';
import * as path from 'path';

import { DeployCredentials, authenticate, addToSolution } from '../models/shared';
import { ComponentType } from '../models/componentType';

interface DeployConfig {
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
    console.error('unable to find config.json file');
    return;
  } else if (!fs.existsSync(path.resolve(currentPath, 'creds.json'))) {
    console.error('unable to find creds.json file');
    return;
  }

  const config: DeployConfig = JSON.parse(fs.readFileSync(path.resolve(currentPath, 'config.json'), 'utf8'));
  const creds: DeployCredentials = JSON.parse(fs.readFileSync(path.resolve(currentPath, 'creds.json'), 'utf8'));

  try {
    const token = await authenticate(creds);

    apiConfig = new WebApiConfig("8.2", token, creds.server);
  } catch (error) {
    console.error(`authentication failure: ${error}`);
    return;
  }

  console.log("\r\ndeploy web resources\r\n");

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

  console.log("\r\ndeployed web resources\r\n");
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

async function deploy(config: DeployConfig, solution?: string, files?: string): Promise<string> {
  const publishXml: string[] = [];
  let resources: WebResource[] = config.webResources;

  if (files != undefined) {
    resources = files.split(',').map(file => {
      const resource = config.webResources.filter(r => r.path.endsWith(file));

      if (resource.length === 0) {
        console.error(`web resource ${file} is not configured`);
        return null;
      } else {
        return resource[0];
      }
    }).filter(r => r != null);
  }

  const promises = resources.map(async resource => {
    let resourceId = await retrieveResource(resource.name);

    const fileContent = fs.readFileSync(resource.path, 'utf8');
    const content = Buffer.from(fileContent).toString("base64");

    if (resourceId != undefined) {
      try {
        const updated = await updateResource(resourceId, resource, content);

        publishXml.push(updated);
      } catch (error) {
        throw new Error(`failed to update resource: ${error.message}`);
      }
    } else {
      try {
        resourceId = await createResource(resource, content);
      } catch (error) {
        throw new Error(`failed to create resource: ${error.message}`);
      }

      if (solution != undefined) {
        try {
          await addToSolution(resourceId, solution, ComponentType.WebResource, apiConfig)
        } catch (error) {
          console.error(`failed to add to solution: ${error.message}`);
        }
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
  console.log(`create web resource ${resource.name}`);

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
  console.log(`update web resource ${resource.name}`);

  const webResource: WebResource = {
    content: content
  };

  await update(apiConfig, "webresourceset", parseGuid(id), webResource);

  return `<webresource>{${id}}</webresource>`;
}

async function publish(publishXml: string) {
  const data: any = {
    ParameterXml: `<importexportxml><webresources>${publishXml}</webresources></importexportxml>`
  };

  await unboundAction(apiConfig, 'PublishXml', data);
}
