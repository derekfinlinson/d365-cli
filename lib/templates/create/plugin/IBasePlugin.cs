using Microsoft.Xrm.Sdk;
using System.Collections.Generic;

namespace Xrm
{
    public interface IBasePlugin : IPlugin
    {
        /// <summary>
        /// List of <see href="RegisteredEvent" /> records for the plugin
        /// </summary>
        IEnumerable<RegisteredEvent> RegisteredEvents { get; }
    }
}
