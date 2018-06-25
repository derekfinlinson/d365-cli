const inquirer = require("inquirer"),    
    fs = require("fs"),
    spawn = require("cross-spawn"),
    chalk = require("chalk"),
    path = require("path");

function prompt() {
    console.log();
    console.log(chalk.green("Select options for web resource project"));
    console.log();
    
    const questions = [
        {
            type: "input",
            name: "namespace",
            message: "Namespace for form and ribbon scripts:"
        },
        {
            type: "confirm",
            name: "git",
            message: "Include .gitignore file?",
            defaut: true
        },
        {
            type: "list",
            name: "package",
            message: "Select package manager:",
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
  
function write (answers) {
    let destinationPath = process.cwd();
    let templatePath = path.resolve(__dirname, "templates", "webresource");

    console.log(chalk.green("Copy web resource project files"));
    console.log();

    // Write files
    fs.copyFileSync(path.resolve(templatePath, "package.json"), path.resolve(destinationPath, "package.json"));
    fs.copyFileSync(path.resolve(templatePath, "config.json"), path.resolve(destinationPath, "config.json"));
    fs.copyFileSync(path.resolve(templatePath, "tsconfig.json"), path.resolve(destinationPath, "tsconfig.json"));
    fs.copyFileSync(path.resolve(templatePath, "webpack.config.js"), path.resolve(destinationPath, "webpack.config.js"));

    if (answers.git) {
        fs.copyFileSync(path.resolve(templatePath, ".gitignore"), path.resolve(destinationPath, ".gitignore"));
    }

    const config = {
        webresource: {
            namespace: answers.namespace
        }
    };

    fs.writeFileSync(path.resolve(destinationPath, ".d365rc"), JSON.stringify(config));

    // Run npm install
    const npmInstall = [
        "install",
        "@types/xrm",
        "node-webresource",
        "webpack-event-plugin",
        "source-map-loader",
        "ts-loader",
        "es6-promise",
        "typescript",
        "webpack",
        "webpack-cli",
        "xrm-webapi",
        "xrm-mock",
        "-D"
    ];

    console.log(chalk.green("Installing base npm packages"));
    console.log();

    spawn.sync("npm", npmInstall, { cwd: destinationPath, stdio: 'inherit' });
}

async function run() {
    const answers = await prompt();

    write(answers);
}

module.exports = (...args) => {
    run(...args);
}
