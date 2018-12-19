import webresource from './create/webresource';
import assembly from './create/assembly';
import consoleProject from './create/console';

export default function create(project: string) {
    switch (project) {
        case 'webresource':
            webresource();
            break;
        case 'plugin':
            assembly('plugin');
            break;
        case 'workflow':
            assembly('workflow');
            break;
        case 'console':
            consoleProject();
            break;
        default:
            console.log('Unknown project type. Enter webresource, plugin, workflow or console');
            break;
    }
}