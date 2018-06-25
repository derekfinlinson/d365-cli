function add(type) {
    switch (type) {
        case "script":
            require("./script")();
            break;
    }
}

module.exports = (...args) => {
    add(...args);
}