using System;
using System.Activities;
using System.ServiceModel;
using Microsoft.Xrm.Sdk;

namespace Xrm
{
    public abstract class BaseWorkflowActivity : CodeActivity
    {
        protected override void Execute(CodeActivityContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            // Get local workflow context
            var localContext = new LocalWorkflowContext(context, this);

            localContext.Trace($"Entered {localContext.WorkflowTypeName}.Execute()");

            try
            {
                // Invoke the custom implementation 
                ExecuteWorkflowActivity(localContext);
            }
            catch (FaultException<OrganizationServiceFault> e)
            {
                localContext.Trace($"Exception: {e}");

                // Handle the exception.
                throw;
            }
            finally
            {
                localContext.Trace($"Exiting {localContext.WorkflowTypeName}.Execute()");
            }
        }

        /// <summary>
        /// Placeholder for a custom plug-in implementation. 
        /// </summary>
        /// <param name="localContext">Context for the current plug-in.</param>
        public abstract void ExecuteWorkflowActivity(LocalWorkflowContext localContext);
    }
}
