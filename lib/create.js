function create(project) {
    switch (project) {
        case 'webresource':
            require('./webresource')();
            break;
        case 'plugin':
            require('./project')('plugin');
            break;
        case 'workflow':
            require('./project')('workflow');
            break;
        case 'console':
            require('./consoleProject')();
            break;
        default:
            console.log('Unknown project type. Enter webresource, plugin, workflow or console');
            break;
    }
}

module.exports = (...args) => {
    create(...args);
}