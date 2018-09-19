namespace Xrm
{
    /// <summary>
    /// Pipeline stage of the Plugin
    /// </summary>
    public enum PipelineStage
    {
        /// <summary>
        /// Pre validation: 10
        /// </summary>
        PreValidation = 10,

        /// <summary>
        /// Pre operation: 20
        /// </summary>
        PreOperation = 20,

        /// <summary>
        /// Post operation: 40
        /// </summary>
        PostOperation = 40
    }
}