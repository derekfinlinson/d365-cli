function add(type, filename) {
    switch (type) {
        case 'css':
            require('./css')(filename);
            break;
        case 'html':
            require('./html')(filename);
            break;
        case 'script':
            require('./script')(filename);
            break;
        case 'test-script':
            require('./test-script')(filename);
            break;
        case 'plugin':
            require('./plugin')(filename);
            break;
        case 'workflow':
            require('./workflow')(filename);
            break;
        default:
            console.log('Unknown file type. Enter css, html, script, test-script, plugin or workflow');
            break;
    }
}

module.exports = (...args) => {
    add(...args);
}