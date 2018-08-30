const inquirer = require('inquirer'),    
    fs = require('fs'),
    path = require('path');

function prompt() {
    console.log();
    console.log('Enter script options:');
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

function write(answers, filename) {
    let destinationPath = process.cwd();
    let templatePath = path.resolve(__dirname, 'templates', 'add');

    // Check for folders and add if necessary
    if (!fs.existsSync(path.resolve(destinationPath, 'src'))) {
        fs.mkdirSync(path.resolve(destinationPath, 'src'));
    }

    if (!fs.existsSync(path.resolve(destinationPath, 'src', 'scripts'))) {
        fs.mkdirSync(path.resolve(destinationPath, 'src', 'scripts'));
    }

    // Check if file already exists
    if (fs.existsSync(path.resolve(destinationPath, 'src', 'scripts', `${filename}.ts`))) {
        console.log(`Script ${filename} already exists`);
        return;
    }

    switch (answers.type) {
        case 'form':
            fs.copyFileSync(path.resolve(templatePath, 'form.ts'), path.resolve(destinationPath, 'src', 'scripts', `${filename}.ts`));
            break;
        case 'ribbon':
            fs.copyFileSync(path.resolve(templatePath, 'ribbon.ts'), path.resolve(destinationPath, 'src', 'scripts', `${filename}.ts`));
            break;
    }

    require('replace-in-file').sync({
        files: path.resolve(destinationPath, 'src', 'scripts', `${filename}.ts`),
        from: /<%= filename %>/g,
        to: filename
    });
    
    // Update config.json
    if (fs.existsSync(path.resolve(destinationPath, 'config.json'))) {
        const config = JSON.parse(fs.readFileSync(path.resolve(destinationPath, 'config.json')));

        config.webResources.push(
            {
                path: `./dist/js/${filename}.js`,
                name: answers.name,
                displayname: answers.displayName,
                type: 'JavaScript'
            }
        );

        config.entries[filename] = `./src/scripts/${filename}.ts`;

        fs.writeFileSync(path.resolve(destinationPath, 'config.json'), JSON.stringify(config), 'utf8');

        console.log();
        console.log(`Added script ${filename}.ts`);
    } else {
        console.log();
        console.log('config.json file not found. Script added to project but not to build tasks');
    }

    if (answers.test) {
        require('./test-script')(filename);
    }
}

async function run(filename) {
    const answers = await prompt();

    write(answers, filename);
}

module.exports = (...args) => {
    run(...args);
}
