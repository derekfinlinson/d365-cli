import * as fs from 'fs';
import * as path from 'path';
import prompts = require('prompts');

interface FileConfig {
    name: string;
    displayName: string;
    filename?: string;
}

export default async function resourceFile(name: string, extension: string) {
    const answers = (await getConfig()) as FileConfig;

    answers.filename = name;

    write(answers, extension);

    console.log(`Added file ${name}`);
}

function getConfig(): Promise<prompts.Answers<string>> {
    console.log();
    console.log(`enter file options`);
    console.log();

    const questions: prompts.PromptObject[] = [
        {
            type: 'text',
            name: 'name',
            message: 'file unique name (including solution prefix):'
        },
        {
            type: 'text',
            name: 'displayName',
            message: 'file display name:'
        }
    ];

    return prompts(questions);
}

function write(config: FileConfig, extension: string): void {
    let destinationPath = process.cwd();

    // Check for folders and add if necessary
    if (!fs.existsSync(path.resolve(destinationPath, 'src'))) {
        fs.mkdirSync(path.resolve(destinationPath, 'src'));
    }

    if (!fs.existsSync(path.resolve(destinationPath, 'src', `${extension}`))) {
        fs.mkdirSync(path.resolve(destinationPath, 'src', `${extension}`));
    }

    switch (extension) {
        case 'css':
            fs.writeFileSync(path.resolve(destinationPath, 'src', 'css', `${config.filename}.css`), '');
            break;
        case 'html':
            let templatePath = path.resolve(__dirname, 'templates');
            fs.copyFileSync(path.resolve(templatePath, 'index.html'), path.resolve(destinationPath, 'src', 'html', `${config.filename}.html`));
            break;
    }
    
    // Update config.json
    if (fs.existsSync(path.resolve(destinationPath, 'config.json'))) {
        const file = JSON.parse(fs.readFileSync(path.resolve(destinationPath, 'config.json'), 'utf8'));

        file.webResources.push(
            {
                path: `./dist/${extension}/${config.filename}.${extension}`,
                name: config.name,
                displayname: config.displayName,
                type: `${extension.toUpperCase()}`
            }
        );

        fs.writeFileSync(path.resolve(destinationPath, 'config.json'), JSON.stringify(file), 'utf8');
    } else {
        console.log('config.json file not found. Script added to project but not to build tasks');
    }
}
