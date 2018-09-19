using System;

namespace Xrm
{
    /// <summary>
    /// Plugin execution event
    /// </summary>
    public class RegisteredEvent
    {
        /// <summary>
        /// Expected pipeline stage of the plugin
        /// </summary>
        public PipelineStage Stage { get; set; }
        /// <summary>
        /// Expected MessageName of the plugin
        /// </summary>
        public string MessageName { get; set; }
        /// <summary>
        /// Expected EntityLogicalName of the plugin
        /// </summary>
        public string EntityLogicalName { get; set; }
        /// <summary>
        /// Action to execute for the event
        /// </summary>
        public Action<IExtendedPluginContext> Execute { get; set; }

        /// <summary>
        /// Initialize a RegisteredEvent without an Action
        /// </summary>
        /// <param name="stage">Pipeline stage</param>
        /// <param name="messageName">Message name</param>
        /// <param name="entityLogicalName">Entity logical name</param>
        public RegisteredEvent(PipelineStage stage, string messageName, string entityLogicalName)
        {
            Stage = stage;
            MessageName = messageName;
            EntityLogicalName = entityLogicalName;
        }

        /// <summary>
        /// Initialize a RegisteredEvent with an Action
        /// </summary>
        /// <param name="stage">Pipeline stage</param>
        /// <param name="messageName">Message name</param>
        /// <param name="entityLogicalName">Entity logical name</param>
        /// <param name="action">Action to execute</param>
        public RegisteredEvent(PipelineStage stage, string messageName, string entityLogicalName, Action<IExtendedPluginContext> action)
        {
            Stage = stage;
            MessageName = messageName;
            EntityLogicalName = entityLogicalName;
            Execute = action;
        }
    }
}
