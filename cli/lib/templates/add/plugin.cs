using System;
using System.Collections.Generic;
using Xrm;

namespace <%= namespace %>
{
    public class <%= name %> : BasePlugin
    {
        public override IEnumerable<RegisteredEvent> RegisterEvents()
        {
            // Add Registered Events
            var events = new List<RegisteredEvent>();

            return events;
        }

        public override void ExecutePlugin(IExtendedPluginContext context)
        {
            // Plugin logic
        }
    }
}
