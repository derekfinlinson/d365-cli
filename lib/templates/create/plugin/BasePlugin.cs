using System;

namespace Xrm
{
    public abstract class BasePlugin : BasePluginHandler
    {
        public override IExtendedPluginContext CreatePluginContext(IServiceProvider serviceProvider)
        {
            return new LocalPluginContext(serviceProvider, this);
        }
    }
}
