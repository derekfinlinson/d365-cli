function create(project) {
    switch (project) {
        case 'webresource':
            require('./webresource')();
            break;
        case 'plugin':
            require('./pluginProject')();
            break;
        case 'workflow':
            require('./workflowProject')();
            break;
        default:
            console.log('Unknown project type. Enter webresrouce, plugin or workflow');
            break;
    }
}

module.exports = (...args) => {
    create(...args);
}