function create(project, name) {
    console.log("Creating project");

    switch (project) {
        case "webresource":
            require("./webresource")(name);
            break;
    }
}

module.exports = (...args) => {
    create(...args);
}