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
            type: 'list',
            name: 'type',
            message: 'Select script type:',
            choices: [
                {
                    name: 'Form Script',
                    value: 'form'
                },
                {
                    name: 'Ribbon Script',
                    value: 'ribbon'
                }
            ]
        },
        {
            type: 'input',
            name: 'name',
            message: 'Script unique name (including solution prefix):'
        },
        {
            type: 'input',
            name: 'displayName',
            message: 'Script display name:'
        },
        {
            type: 'confirm',
            name: 'test',
            message: 'Include test file?'
        }
    ];

    return inquirer.prompt(questions);
}

function write(answers) {
    let destinationPath = process.cwd();
    let templatePath = path.resolve(__dirname, "templates", "add");

    // Check for folders and add if necessary
    if (!fs.exists(path.resolve(destinationPath, 'src'))) {
        fs.mkdirSync(path.resolve(destinationPath, 'src'));
    }

    if (!fs.exists(path.resolve(destinationPath, 'src', 'scripts'))) {
        fs.mkdirSync(path.resolve(destinationPath, 'src', 'scripts'));
    }

    switch (answers.type) {
        case 'form':
            fs.copyFileSync(path.resolve(templatePath, "form.ts"), path.resolve(destinationPath, "src", "scripts", `${answers.filename}.ts`));
            break;
        case 'ribbon':
            fs.copyFileSync(path.resolve(templatePath, "ribbon.ts"), path.resolve(destinationPath, "src", "scripts", `${answers.filename}.ts`));
            break;
    }
    
    // Update config.json
    if (fs.exists(path.resolve(destinationPath, "config.json"))) {
        const config = fs.readJSON(path.resolve(destinationPath, "config.json"));

        config.webResources.push(
            {
                path: `./dist/js/${answers.filename}.js`,
                name: answers.name,
                displayname: answers.displayName,
                type: 'JavaScript'
            }
        );

        fs.extendJSON(path.resolve(destinationPath, "config.json"), config);
    } else {
        console.log("config.json file not found. Script added to project but not to build tasks");
    }

    if (answers.test) {
        require('./test-script')(answers.filename);
    }
}

async function run(filename) {
    const answers = await prompt();

    answers.filename = filename;
    
    write(answers);
    
    console.log(chalk.green(`Added file ${filename}.ts`));
}

module.exports = (...args) => {
    run(...args);
}
