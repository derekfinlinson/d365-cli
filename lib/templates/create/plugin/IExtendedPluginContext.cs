using Microsoft.Xrm.Sdk;

namespace Xrm
{
    public interface IExtendedPluginContext : IPluginExecutionContext, ITracingService
    {
        /// <summary>
        /// Fullname of the plugin
        /// </summary>
        string PluginTypeName { get; }

        /// <summary>
        /// Event the plugin is executing against
        /// </summary>
        RegisteredEvent Event { get; }

        /// <summary>
        /// Gets an entity reference from the context PrimaryEntityName and PrimaryEntityId
        /// </summary>
        EntityReference PrimaryEntity { get; }

        /// <summary>
        /// Pre Image alias name
        /// </summary>
        string PreImageAlias { get; }

        /// <summary>
        /// Post Image alias name
        /// </summary>
        string PostImageAlias { get; }

        /// <summary>
        /// IPluginExecutionContext contains information that describes the run-time environment in which the plug-in executes, 
        /// information related to the execution pipeline, and entity business information
        /// </summary>
        IPluginExecutionContext PluginExecutionContext { get; }

        /// <summary>
        /// Synchronous registered plug-ins can post the execution context to the Microsoft Azure Service Bus. <br/> 
        /// It is through this notification service that synchronous plug-ins can send brokered messages to the Microsoft Azure Service Bus
        /// </summary>
        IServiceEndpointNotificationService NotificationService { get; }

        /// <summary>
        /// Provides logging run-time trace information for plug-ins
        /// </summary>
        ITracingService TracingService { get; }

        /// <summary>
        /// <see cref="IOrganizationService"/> using the user from the plugin context
        /// </summary>
        IOrganizationService OrganizationService { get; }

        /// <summary>
        /// <see cref="IOrganizationService"/> using the SYSTEM user
        /// </summary>
        IOrganizationService SystemOrganizationService { get; }

        /// <summary>
        /// <see cref="IOrganizationService"/> using the initiating user from the plugin context
        /// </summary>
        IOrganizationService InitiatingUserOrganizationService { get; }

        /// <summary>
        /// Get a <see href="OrganizationRequest" /> object for the current plugin execution
        /// </summary>
        OrganizationRequest GetRequest<T>() where T : OrganizationRequest, new();

        /// <summary>
        /// Get a <see href="OrganizationResponse" /> object for the current plugin execution
        /// </summary>
        OrganizationResponse GetResponse<T>() where T : OrganizationResponse, new();

        bool PreventDuplicatePluginExecution(); 
    }
}
