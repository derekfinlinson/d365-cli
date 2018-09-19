using System.Collections.Generic;
using System.Linq;
using Microsoft.Xrm.Sdk;

namespace Xrm
{
    public static class Extensions
    {
        public static RegisteredEvent GetEvent(this IPluginExecutionContext context, IEnumerable<RegisteredEvent> events)
        {
            return events.FirstOrDefault(e =>
                    (int)e.Stage == context.Stage
                    && e.MessageName == context.MessageName
                    && (string.IsNullOrWhiteSpace(e.EntityLogicalName) || e.EntityLogicalName == context.PrimaryEntityName)
            );
        }
    }
}
