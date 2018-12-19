export default function deploy(type: string, name?: string) {
    switch (type) {
        case 'webresource':
            require('./webresource')();
            break;
        case 'plugin':
            require('./project')('plugin');
            break;
        case 'workflow':
            require('./project')('workflow');
            break;
        default:
            console.log('Unknown type. Enter webresource, plugin or workflow');
            break;
    }
}