using System;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Workflow;
using  System.Activities;

namespace Xrm
{
    public class LocalWorkflowContext
    {
        public string WorkflowTypeName { get; }

        /// <summary>
        /// Primary entity from the context as an entity reference
        /// </summary>
        public EntityReference PrimaryEntity => new EntityReference(WorkflowContext.PrimaryEntityName, WorkflowContext.PrimaryEntityId);

        public CodeActivityContext ExecutionContext { get; set; }

        /// <summary>
        /// Workflow context
        /// </summary>
        public IWorkflowContext WorkflowContext { get; }

        /// <summary>
        /// Provides logging run-time trace information for plug-ins. 
        /// </summary>
        public ITracingService TracingService { get; }

        private readonly IOrganizationServiceFactory _factory;
        private IOrganizationService _organizationService;
        private IOrganizationService _systemOrganizationService;
        private IOrganizationService _initiatedOrganizationService;

        public IOrganizationService OrganizationService => _organizationService ?? (_organizationService = CreateOrganizationService(WorkflowContext.UserId));

        public IOrganizationService SystemOrganizationService => _systemOrganizationService ?? (_systemOrganizationService = CreateOrganizationService(null));

        public IOrganizationService InitiatingUserOrganizationService => _initiatedOrganizationService ?? (_initiatedOrganizationService = CreateOrganizationService(WorkflowContext.InitiatingUserId));

        public LocalWorkflowContext(CodeActivityContext activityContext, BaseWorkflowActivity workflow)
        {
            // Obtain the activity execution context
            ExecutionContext = activityContext ?? throw new ArgumentNullException(nameof(activityContext));

            // Obtain the execution context service from activity context
            WorkflowContext = activityContext.GetExtension<IWorkflowContext>();

            // Obtain the tracing service from the activity context
            TracingService = activityContext.GetExtension<ITracingService>();

            // Obtain the organization factory service from the activity context
            _factory = activityContext.GetExtension<IOrganizationServiceFactory>();

            WorkflowTypeName = workflow.GetType().FullName;
        }

        /// <summary>
        /// Create CRM Organization Service for a specific user id
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <returns>CRM Organization Service</returns>
        /// <remarks>Useful for impersonation</remarks>
        public IOrganizationService CreateOrganizationService(Guid? userId)
        {
            return _factory.CreateOrganizationService(userId);
        }

        /// <summary>
        /// Writes a trace message to the CRM trace log.
        /// </summary>
        /// <param name="message">Message name to trace.</param>
        public void Trace(string message)
        {
            if (string.IsNullOrWhiteSpace(message) || TracingService == null)
            {
                return;
            }

            TracingService.Trace(message);
        }
    }
}
