function create(project) {
    switch (project) {
        case 'webresource':
            require('./webresource')();
            break;
        case 'plugin':
            require('./pluginProject')();
            break;
    }
}

module.exports = (...args) => {
    create(...args);
}