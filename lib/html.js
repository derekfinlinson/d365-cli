const inquirer = require("inquirer"),    
    fs = require("fs"),
    path = require("path");

function prompt() {
    console.log();
    console.log("Enter HTML file options");
    console.log();

    const questions = [
        {
            type: 'input',
            name: 'name',
            message: 'HTML file unique name (including solution prefix):'
        },
        {
            type: 'input',
            name: 'displayName',
            message: 'HTML file display name:'
        }
    ];

    return inquirer.prompt(questions);
}

function write(answers) {
    console.log();
    console.log("Adding HTML file");
    console.log();

    let destinationPath = process.cwd();
    let templatePath = path.resolve(__dirname, "templates", "add");

    // Check for folders and add if necessary
    if (!fs.exists(path.resolve(destinationPath, 'src'))) {
        fs.mkdirSync(path.resolve(destinationPath, 'src'));
    }

    if (!fs.exists(path.resolve(templdestinationPathatePath, 'src', 'html'))) {
        fs.mkdirSync(path.resolve(destinationPath, 'src', 'html'));
    }

    fs.copyFileSync(path.resolve(templatePath, "index.html"), path.resolve(destinationPath, "src", "html", `${answers.filename}.html`));
    
    // Update config.json
    if (fs.exists(path.resolve(destinationPath, "config.json"))) {
        const config = fs.readJSON(path.resolve(destinationPath, "config.json"));

        config.webResources.push(
            {
                path: `./dist/html/${answers.filename}.html`,
                name: answers.name,
                displayname: answers.displayName,
                type: 'HTML'
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

    console.log(`Added file ${name}.html`);
}

module.exports = (...args) => {
    run(...args);
}
