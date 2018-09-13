function add(type, filename) {
    switch (type) {
        case 'script':
            require('./script')(filename);
            break;
        case 'test-script':
            require('./test-script')(filename);
            break;
        case 'plugin':
            require('./plugin')(filename);
            break;
    }
}

module.exports = (...args) => {
    add(...args);
}