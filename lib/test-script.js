const inquirer = require("inquirer"),    
    fs = require("fs"),
    path = require("path"),
    chalk = require("chalk");

function prompt() {
    console.log();
    console.log(chalk.green("Select script options"));
    console.log();

    const questions = [
        {
            type: 'input',
            name: 'entity',
            message: 'Entity logical name:'
        },
        {
            type: 'input',
            name: 'form',
            message: 'Form name:'
        }
    ];

    return inquirer.prompt(questions);
}

async function write(answers) {
    let destinationPath = process.cwd();
    let templatePath = path.resolve(__dirname, "templates", "script");

    // Check for folders and add if necessary
    if (!fs.exists(path.resolve(destinationPath, 'test'))) {
        fs.mkdirSync(path.resolve(destinationPath, 'test'));
    }

    if (!fs.exists(path.resolve(destinationPath, 'test', 'scripts'))) {
        fs.mkdirSync(path.resolve(destinationPath, 'test', 'scripts'));
    }

    // Write script test file
    fs.writeFileSync(path.resolve(destinationPath, "test", "scripts", `${answers.filename}.test.ts`));

    // Generate form mock
}

async function run(filename) {
    const answers = await prompt();

    answers.filename = filename;

    await write(answers);
}

module.exports = (...args) => {
    run(...args);
}
