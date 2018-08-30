const inquirer = require("inquirer"),    
    fs = require("fs"),
    path = require("path");

function prompt() {
    console.log();
    console.log("Enter CSS file options");
    console.log();

    const questions = [
        {
            type: 'input',
            name: 'name',
            message: 'CSS file unique name (including solution prefix):'
        },
        {
            type: 'input',
            name: 'displayName',
            message: 'CSS file display name:'
        }
    ];

    return inquirer.prompt(questions);
}

function write(answers) {
    console.log();
    console.log("Adding CSS file");
    console.log();

    let destinationPath = process.cwd();

    // Check for folders and add if necessary
    if (!fs.exists(path.resolve(destinationPath, 'src'))) {
        fs.mkdirSync(path.resolve(destinationPath, 'src'));
    }

    if (!fs.exists(path.resolve(destinationPath, 'src', 'css'))) {
        fs.mkdirSync(path.resolve(destinationPath, 'src', 'css'));
    }

    fs.writeFileSync(path.resolve(destinationPath, "src", "css", `${answers.filename}.css`));
    
    // Update config.json
    if (fs.exists(path.resolve(destinationPath, "config.json"))) {
        const config = fs.readJSON(path.resolve(destinationPath, "config.json"));

        config.webResources.push(
            {
                path: `./dist/css/${answers.filename}.css`,
                name: answers.name,
                displayname: answers.displayName,
                type: 'CSS'
            }
        );

        fs.extendJSON(path.resolve(destinationPath, "config.json"), config);
    } else {
        console.log("config.json file not found. Script added to project but not to build tasks");
    }
}

function run (name) {
    const answers = await prompt();

    answers.filename = name;

    write(answers);

    console.log(`Added file ${name}.css`);
}

module.exports = (...args) => {
    run(...args);
}
