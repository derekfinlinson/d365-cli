import { AuthenticationContext, TokenResponse } from 'adal-node';
import { ComponentType } from './componentType';
import { unboundAction } from 'xrm-webapi/dist/webapi-node';
import { WebApiConfig } from 'xrm-webapi/dist/models';

export interface DeployCredentials {
  tenant: string;
  clientId?: string;
  clientSecret?: string;
  server: string;
  username?: string;
  password?: string;
  solution?: string;
}

export function authenticate(creds: DeployCredentials): Promise<string> {
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

export async function addToSolution(id: string, solution: string, type: ComponentType, apiConfig: WebApiConfig) {
  const data: any = {
    ComponentId: id,
    ComponentType: type,
    SolutionUniqueName: solution,
    AddRequiredComponents: false,
    IncludedComponentSettingsValues: null
  };

  await unboundAction(apiConfig, 'AddSolutionComponent', data);
}
