using System;
using Microsoft.Xrm.Sdk;

namespace Xrm
{
    public class BasePluginContext : IExtendedPluginContext
    {
        #region IPluginExecutionContext Properties
        public int Stage => PluginExecutionContext.Stage;
        public IPluginExecutionContext ParentContext => PluginExecutionContext.ParentContext;
        public int Mode => PluginExecutionContext.Mode;
        public int IsolationMode => PluginExecutionContext.IsolationMode;
        public int Depth => PluginExecutionContext.Depth;
        public string MessageName => PluginExecutionContext.MessageName;
        public string PrimaryEntityName => PluginExecutionContext.PrimaryEntityName;
        public Guid? RequestId => PluginExecutionContext.RequestId;
        public string SecondaryEntityName => PluginExecutionContext.SecondaryEntityName;
        public ParameterCollection InputParameters => PluginExecutionContext.InputParameters;
        public ParameterCollection OutputParameters => PluginExecutionContext.OutputParameters;
        public ParameterCollection SharedVariables => PluginExecutionContext.SharedVariables;
        public Guid UserId => PluginExecutionContext.UserId;
        public Guid InitiatingUserId => PluginExecutionContext.InitiatingUserId;
        public Guid BusinessUnitId => PluginExecutionContext.BusinessUnitId;
        public Guid OrganizationId => PluginExecutionContext.OrganizationId;
        public string OrganizationName => PluginExecutionContext.OrganizationName;
        public Guid PrimaryEntityId => PluginExecutionContext.PrimaryEntityId;
        public EntityImageCollection PreEntityImages => PluginExecutionContext.PreEntityImages;
        public EntityImageCollection PostEntityImages => PluginExecutionContext.PostEntityImages;
        public EntityReference OwningExtension => PluginExecutionContext.OwningExtension;
        public Guid CorrelationId => PluginExecutionContext.CorrelationId;
        public bool IsExecutingOffline => PluginExecutionContext.IsExecutingOffline;
        public bool IsOfflinePlayback => PluginExecutionContext.IsOfflinePlayback;
        public bool IsInTransaction => PluginExecutionContext.IsInTransaction;
        public Guid OperationId => PluginExecutionContext.OperationId;
        public DateTime OperationCreatedOn => PluginExecutionContext.OperationCreatedOn;
        #endregion

        /// <summary>
        /// Name of the plugin the context is running against
        /// </summary>
        public string PluginTypeName { get; }

        /// <summary>
        /// Pipeline stage for the context
        /// </summary>
        public PipelineStage PipelineStage => (PipelineStage)Stage;
        
        /// <summary>
        /// Primary entity from the context as an entity reference
        /// </summary>
        public EntityReference PrimaryEntity => new EntityReference(PrimaryEntityName, PrimaryEntityId);

        /// <summary>
        /// Event the current plugin is executing for
        /// </summary>
        public RegisteredEvent Event { get; private set; }

        /// <summary>
        /// IPluginExecutionContext contains information that describes the run-time environment in which the plug-in executes, 
        /// information related to the execution pipeline, and entity business information
        /// </summary>
        public IPluginExecutionContext PluginExecutionContext { get; }

        /// <summary>
        /// Synchronous registered plug-ins can post the execution context to the Microsoft Azure Service Bus. <br/> 
        /// It is through this notification service that synchronous plug-ins can send brokered messages to the Microsoft Azure Service Bus
        /// </summary>
        public IServiceEndpointNotificationService NotificationService { get; }

        /// <summary>
        /// Provides logging run-time trace information for plug-ins
        /// </summary>
        public ITracingService TracingService { get; }

        /// <summary>
        /// Pre Image alias name
        /// </summary>
        public string PreImageAlias => "PreImage";

        /// <summary>
        /// Post Image alias name
        /// </summary>
        public string PostImageAlias => "PostImage";

        private readonly IOrganizationServiceFactory _factory;
        private IOrganizationService _organizationService;
        private IOrganizationService _systemOrganizationService;
        private IOrganizationService _initiatedOrganizationService;
        private OrganizationRequest _request;
        private OrganizationResponse _response;

        /// <summary>
        /// <see cref="IOrganizationService"/> using the user from the plugin context
        /// </summary>
        public IOrganizationService OrganizationService => _organizationService ?? (_organizationService = CreateOrganizationService(UserId));

        /// <summary>
        /// <see cref="IOrganizationService"/> using the SYSTEM user
        /// </summary>
        public IOrganizationService SystemOrganizationService => _systemOrganizationService ?? (_systemOrganizationService = CreateOrganizationService(null));

        /// <summary>
        /// <see cref="IOrganizationService"/> using the initiating user from the plugin context
        /// </summary>
        public IOrganizationService InitiatingUserOrganizationService => _initiatedOrganizationService ?? (_initiatedOrganizationService = CreateOrganizationService(InitiatingUserId));

        /// <summary>
        /// Get a <see href="OrganizationRequest" /> object for the current plugin execution
        /// </summary>
        public OrganizationRequest GetRequest<T>() where T : OrganizationRequest, new()
        {
            return _request ?? (_request = new T { Parameters = PluginExecutionContext.InputParameters });
        }

        /// <summary>
        /// Get a <see href="OrganizationResponse" /> object for the current plugin execution
        /// </summary>
        public OrganizationResponse GetResponse<T>() where T : OrganizationResponse, new()
        {
            return _response ?? (_response = new T { Results = PluginExecutionContext.OutputParameters });
        }

        /// <summary>
        /// Helper object that stores the services available in this plug-in
        /// </summary>
        /// <param name="serviceProvider">IServiceProvider</param>
        /// <param name="plugin">Plugin handler</param>
        public BasePluginContext(IServiceProvider serviceProvider, BasePlugin plugin)
        {
            if (serviceProvider == null)
            {
                throw new ArgumentNullException(nameof(serviceProvider));
            }

            // Obtain the execution context service from the service provider.
            PluginExecutionContext = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));

            // Obtain the tracing service from the service provider.
            TracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            // Get the notification service from the service provider.
            NotificationService = (IServiceEndpointNotificationService)serviceProvider.GetService(typeof(IServiceEndpointNotificationService));

            // Obtain the organization factory service from the service provider.
            _factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));

            // Set Event
            Event = PluginExecutionContext.GetEvent(plugin.RegisteredEvents);

            PluginTypeName = plugin.GetType().FullName;
        }

        /// <summary>
        /// Prevent plugin from running multiple times for the same context
        /// </summary>
        public bool PreventDuplicatePluginExecution()
        {
            // Delete message can't be called twice so can ignore
            if (Event.MessageName == "Delete")
            {
                return false;
            }

            var key = $"{PluginTypeName}|{MessageName}|{PipelineStage}|{PrimaryEntityId}";

            // Check if key exists in shared variables
            if (this.GetSharedVariable<bool>(key) == true)
            {
                return true;
            }

            // Add key to shared variables
            SharedVariables.Add(key, true);

            return false;
        }

        /// <summary>
        /// Create an instance of <see cref="IOrganizationService"/> with provided user id
        /// </summary>
        /// <param name="userId">User id to use</param>
        /// <returns>IOrganizationService</returns>
        public IOrganizationService CreateOrganizationService(Guid? userId)
        {
            return _factory.CreateOrganizationService(userId);
        }

        /// <summary>
        /// Writes a trace message to the CRM trace log.
        /// </summary>
        /// <param name="format">Message format</param>
        /// <param name="args">Message format arguments</param>
        public void Trace(string format, params object[] args)
        {
            TracingService.Trace(format, args);
        }
    }
}
