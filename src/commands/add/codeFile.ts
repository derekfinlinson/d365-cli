import * as fs from 'fs';
import * as path from 'path';
import { prompt, QuestionCollection } from 'inquirer';

export default async function codeFile(type: string, filename: string) {
  await write(type, filename);

  console.log(`\r\nadded ${type} ${filename}.cs\r\n`);
}

async function write(type: string, filename: string) {
  let destinationPath = process.cwd();
  let templatePath = path.resolve(__dirname, 'templates');

  // Check if file already exists
  if (fs.existsSync(path.resolve(destinationPath, `${filename}.cs`))) {
    console.log(`${type} ${filename} already exists`);
    return;
  }

  filename = filename.replace('.cs', '');

  // Get namespace from csproj file
  let files: string[];
  let folder = destinationPath;

  do {
    files = fs.readdirSync(folder).filter(f => f.endsWith('.csproj'));
    folder = path.resolve(folder, '..');
  } while (files.length === 0 && !path.isAbsolute(folder))

  const namespace = files.length === 0 ? 'Xrm' : path.basename(files[0]).replace('.csproj', '');

  let content: string = fs.readFileSync(path.resolve(templatePath, `${type}.cs`), 'utf8');

  content = content.replace('<%= namespace %>', namespace);
  content = content.replace('<%= name %>', filename);

  fs.writeFileSync(path.resolve(destinationPath, `${filename}.cs`), content);

  // Update config.json
  if (fs.existsSync(path.resolve(destinationPath, 'config.json'))) {
    const file = JSON.parse(fs.readFileSync(path.resolve(destinationPath, 'config.json'), 'utf8'));

    if (type === 'plugin') {
      if (file.plugins == null) {
        file.plugins = [];
      }

      file.plugins.push(
        {
          plugin: `${filename}.cs`
        }
      );
    } else {
      if (file.workflows == null) {
        file.workflows = [];
      }

      file.workflows.push(
        {
          workflow: `${filename}.cs`
        }
      );
    }

    fs.writeFileSync(path.resolve(destinationPath, 'config.json'), JSON.stringify(file), 'utf8');
  }
}
