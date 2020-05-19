import * as fs from 'fs';
import * as path from 'path';
import test from './test-script';
import prompts from 'prompts';

interface ScriptConfig {
  name: string;
  displayName: string;
  type: string;
  test: boolean;
  filename: string;
}

export default async function script(filename: string) {
  const config = (await getConfig()) as ScriptConfig;

  filename = filename.replace('.js', '');
  filename = filename.replace('.ts', '');

  config.filename = filename;

  write(config);
}

function getConfig(): Promise<prompts.Answers<string>> {
  console.log('\r\nenter script options:\r\n');

  const questions: prompts.PromptObject[] = [
    {
      type: 'select',
      name: 'type',
      message: 'select script type:',
      choices: [
        {
          title: 'form script',
          value: 'form'
        },
        {
          title: 'ribbon script',
          value: 'ribbon'
        },
        {
          title: 'other',
          value: 'other'
        }
      ]
    },
    {
      type: 'text',
      name: 'name',
      message: 'script unique name (including solution prefix):'
    },
    {
      type: 'text',
      name: 'displayName',
      message: 'script display name:'
    },
    {
      type: 'confirm',
      name: 'test',
      message: 'include test file?',
      initial: true
    }
  ];

  return prompts(questions);
}

function write(config: ScriptConfig) {
  let destinationPath = process.cwd();
  let templatePath = path.resolve(__dirname, 'templates');

  // Check for folders and add if necessary
  if (!fs.existsSync(path.resolve(destinationPath, 'src'))) {
    fs.mkdirSync(path.resolve(destinationPath, 'src'));
  }

  if (!fs.existsSync(path.resolve(destinationPath, 'src', 'scripts'))) {
    fs.mkdirSync(path.resolve(destinationPath, 'src', 'scripts'));
  }

  // Check if file already exists
  if (fs.existsSync(path.resolve(destinationPath, 'src', 'scripts', `${config.filename}.ts`))) {
    console.log(`script ${config.filename} already exists`);
    return;
  }

  switch (config.type) {
    case 'form':
      fs.copyFileSync(path.resolve(templatePath, 'form.ts'), path.resolve(destinationPath, 'src', 'scripts', `${config.filename}.ts`));
      break;
    case 'ribbon':
      fs.copyFileSync(path.resolve(templatePath, 'ribbon.ts'), path.resolve(destinationPath, 'src', 'scripts', `${config.filename}.ts`));
      break;
    case 'other':
      fs.writeFileSync(path.resolve(destinationPath, 'src', 'scripts', `${config.filename}.ts`), '');
  }

  // Update config.json
  if (fs.existsSync(path.resolve(destinationPath, 'config.json'))) {
    const file = JSON.parse(fs.readFileSync(path.resolve(destinationPath, 'config.json'), 'utf8'));

    if (file.webResources != null) {
      file.webResources.push(
        {
          path: `./dist/scripts/${config.filename}.js`,
          name: config.name,
          displayname: config.displayName,
          type: 'JavaScript'
        }
      );
    }

    file.entries[config.filename] = `./src/scripts/${config.filename}.ts`;

    fs.writeFileSync(path.resolve(destinationPath, 'config.json'), JSON.stringify(file), 'utf8');

    console.log(`\r\nadded script ${config.filename}.ts`);
  } else {
    console.log('\r\nconfig.json file not found. script added to project but not to build tasks');
  }

  if (config.test) {
    test(config.filename);
  }
}
