using System.Collections.Generic;
using System.Linq;
using Microsoft.Xrm.Sdk;

namespace Xrm
{
    public static class Extensions
    {
        #region IPluginExecutionContext Extensions

        public static RegisteredEvent GetEvent(this IPluginExecutionContext context, IEnumerable<RegisteredEvent> events)
        {
            return events.FirstOrDefault(e =>
                    (int)e.Stage == context.Stage
                    && e.MessageName == context.MessageName
                    && (string.IsNullOrWhiteSpace(e.EntityLogicalName) || e.EntityLogicalName == context.PrimaryEntityName)
            );
        }

        public static T GetSharedVariable<T>(this IPluginExecutionContext context, string key)
        {
            while (context != null)
            {
                if (context.SharedVariables.ContainsKey(key))
                {
                    return (T)(context.SharedVariables[key] ?? default(T));
                }

                context = context.ParentContext;
            }

            return default(T);
        }

        public static object GetSharedVariable(this IPluginExecutionContext context, string key)
        {
            while (context != null)
            {
                if (context.SharedVariables.ContainsKey(key))
                {
                    return context.SharedVariables[key];
                }

                context = context.ParentContext;
            }

            return null;
        }

        #endregion
    }
}
