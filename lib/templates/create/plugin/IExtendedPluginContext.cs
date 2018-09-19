using Microsoft.Xrm.Sdk;

namespace Xrm
{
    public interface IExtendedPluginContext : IPluginExecutionContext
    {
        OrganizationRequest GetRequest<T>() where T : OrganizationRequest, new();
        OrganizationResponse GetResponse<T>() where T : OrganizationResponse, new();
        string PluginTypeName { get; }
        string PreImageAlias { get; }
        string PostImageAlias { get; }
        RegisteredEvent Event { get; }
        EntityReference PrimaryEntity { get; }
        IPluginExecutionContext PluginExecutionContext { get; }
        IServiceEndpointNotificationService NotificationService { get; }
        ITracingService TracingService { get; }
        IOrganizationService OrganizationService { get; }
        IOrganizationService SystemOrganizationService { get; }
        IOrganizationService InitiatingUserOrganizationService { get; }
        void Trace(string message);
    }
}
