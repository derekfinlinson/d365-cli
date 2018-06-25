function create(project) {
    console.log("Creating project");

    switch (project) {
        case "webresource":
            require("./webresource")();
            break;
    }
}

module.exports = (...args) => {
    create(...args);
}