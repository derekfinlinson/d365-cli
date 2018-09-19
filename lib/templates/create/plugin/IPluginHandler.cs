using Microsoft.Xrm.Sdk;
using System.Collections.Generic;

namespace Xrm
{
    public interface IPluginHandler : IPlugin
    {
        List<RegisteredEvent> RegisteredEvents { get; }

        void RegisterEvents();
    }
}
