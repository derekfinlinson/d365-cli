function add(type, name) {
    switch (type) {
        case "script":
            require("./script")(name);
            break;
    }
}

module.exports = (...args) => {
    add(...args);
}