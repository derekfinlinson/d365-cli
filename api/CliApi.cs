using System;
using System.Collections.Generic;
using Microsoft.Xrm.Tooling.Connector;
using Xrm;

namespace D365.Cli.Api
{
    public class CliApi
    {
        private CrmServiceClient _client;
        
        public void Connect(string connectionString)
        {
            
            _client = new CrmServiceClient(connectionString);
        }

        public void DeployWebResource(List<WebResource> webResources)
        {
            // Validate client is connected
            if (_client == null || _client.IsReady)
            {
                Console.WriteLine("Connect to Dynamics 365 before deploying web resources");
                return;    
            }

            // Retrieve web resources
            using (var ctx = new CrmServiceContext(_client))
            {
                foreach (var resource in webResources)
                {
                    // Create or update web resource

                    // Publish web resources for updates

                    // Add components to solution for inserts
                }
            }
        }

        public void DeployPlugin()
        {

        }

        public void DeployWorkflow()
        {

        }
    }
}