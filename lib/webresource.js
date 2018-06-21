const inquirer = require("inquirer"),    
    fs = require("fs"),
    path = require("path"),
    chalk = require("chalk");

function prompt() {
    console.log();
    console.log(chalk.green("Select options for web resource project"));
    console.log();
    
    const questions = [
        {
            type: "input",
            name: "namespace",
            message: "Namespace for form and ribbon scripts."
        },
        {
            type: "confirm",
            name: "git",
            message: "Add a .gitignore file?",
            defaut: true
        },
        {
            type: "list",
            name: "package",
            message: "Select package manager.",
            default: "npm",
            choices: [
                {
                    name: "NPM",
                    value: "npm"
                },
                {
                    name: "Yarn",
                    value: "yarn"
                }
            ]
        }
    ];

    return inquirer.prompt(questions);
}
  
function install (answers, projectFolder) {
    const destinationPath = process.cwd();
    const templatePath = "./templates/webresource";

    console.log("Writing template files");

    // Write files

    // Run npm install
    const packages = [
        "@types/xrm",
        "node-webresource",
        "webpack-event-plugin",
        "source-map-loader",
        "ts-loader",
        "es6-promise",
        "typescript",
        "webpack", "^4.5.0",
        "webpack-cli",
        "xrm-webapi",
        "xrm-mock"
    ];
}

async function run(projectFolder) {
    const answers = await prompt();

    install(answers, projectFolder);
}

module.exports = (...args) => {
    run(...args);
}
