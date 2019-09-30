import * as fs from 'fs';
import * as glob from 'glob';
import { ComponentType } from './componentType';
import { WebApiConfig } from 'xrm-webapi/dist/models';
import { addToSolution } from './shared';
import { retrieveMultiple, createWithReturnData, update } from 'xrm-webapi/dist/webapi-node';

export interface PluginAssembly {
  name?: string;
  content?: string;
  isolationmode?: number;
  version?: string;
  publickeytoken?: string;
  sourcetype?: number;
  culture?: string;
  types?: AssemblyType[];
}

interface AssemblyType {
  name?: string;
  steps?: Step[];
}

interface Step {

}

export async function deployAssembly(config: PluginAssembly, type: string, solution: string, apiConfig: WebApiConfig): Promise<string> {
  const files = glob.sync(`**/${config.name}.dll`);

  if (files.length === 0) {
    console.error(`assembly ${config.name}.dll not found`);
    return;
  }

  const content = fs.readFileSync(files[0]).toString('base64');

  let assemblyId = await retrieveAssembly(config.name, apiConfig);

  if (assemblyId != undefined) {
    try {
      await updateAssembly(assemblyId, config, type, content, apiConfig);
    } catch (error) {
      throw new Error(`failed to update ${type}: ${error.message}`);
    }
  } else {
    try {
      assemblyId = await createAssembly(config, type, content, apiConfig);
    } catch (error) {
      throw new Error(`failed to create ${type}: ${error.message}`);
    }

    if (solution != undefined) {
      try {
        await addToSolution(assemblyId, solution, ComponentType.PluginAssembly, apiConfig);
      } catch (error) {
        console.error(`failed to add to solution: ${error.message}`);
      }
    }
  }

  return assemblyId;
}

async function retrieveAssembly(name: string, apiConfig: WebApiConfig) {
  const options = `$select=pluginassemblyid&$filter=name eq '${name}'`;

  const result = await retrieveMultiple(apiConfig, 'pluginassemblies', options);

  return result.value.length > 0 ? result.value[0].pluginassemblyid : undefined;
}

async function createAssembly(config: PluginAssembly, type: string, content: string, apiConfig: WebApiConfig) {
  console.log(`create ${type} ${config.name}`);

  const assembly: PluginAssembly = {
    name: config.name,
    content: content,
    isolationmode: config.isolationmode,
    version: config.version,
    publickeytoken: config.name,
    sourcetype: 0,
    culture: ''
  };

  const result = await createWithReturnData(apiConfig, 'pluginassemblies', assembly, 'pluginassemblyid');

  return result.pluginassemblyid;
}

async function updateAssembly(id: string, config: PluginAssembly, type: string, content: string, apiConfig: WebApiConfig) {
  console.log(`update ${type} ${config.name}`);

  const assembly: PluginAssembly = {
    content: content,
    version: config.version
  };

  return update(apiConfig, 'pluginassemblies', id, assembly);
}
