import { WebApiConfig } from "xrm-webapi/dist/models";
import { retrieveMultiple, createWithReturnData, update } from "xrm-webapi/dist/webapi-node";
import { addToSolution } from "./shared";
import { ComponentType } from "./componentType";

export interface PluginType {
  name: string;
  'pluginassemblyid@odata.bind'?: string;
  typename: string;
  friendlyname: string;
}

export async function deployType(type: PluginType, solution: string, apiConfig: WebApiConfig): Promise<string> {
  let typeId = await retrieveType(type.name, apiConfig);

  if (typeId != undefined) {
    try {
      await updateType(typeId, type, apiConfig);
    } catch (error) {
      throw new Error(`failed to update plugin type: ${error.message}`);
    }
  } else {
    try {
      typeId = await createType(type, apiConfig);
    } catch (error) {
      throw new Error(`failed to create plugin type: ${error.message}`);
    }

    if (solution != undefined) {
      try {
        await addToSolution(typeId, solution, ComponentType.PluginType, apiConfig);
      } catch (error) {
        console.error(`failed to add to solution: ${error.message}`);
      }
    }
  }

  return typeId;
}

async function retrieveType(name: string, apiConfig: WebApiConfig) {
  const options = `$select=plugintypeid&$filter=name eq '${name}'`;

  const result = await retrieveMultiple(apiConfig, 'plugintypes', options);

  return result.value.length > 0 ? result.value[0].plugintypeid : undefined;
}

async function createType(type: PluginType, apiConfig: WebApiConfig) {
  console.log(`create plugin type ${type.name}`);

  const result = await createWithReturnData(apiConfig, 'plugintypes', type, 'plugintypeid');

  return result.plugintypeid;
}

async function updateType(id: string, type: PluginType, apiConfig: WebApiConfig) {
  console.log(`update plugin type ${type.name}`);

  return update(apiConfig, 'plugintypes', id, type);
}
