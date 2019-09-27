import * as fs from 'fs';
import * as path from 'path';

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
      if (file.assembly.plugins == null) {
        file.assembly.plugins = [];
      }

      file.assembly.plugins.push(
        {
          name: `${filename}.cs`
        }
      );
    } else {
      if (file.assembly.workflows == null) {
        file.assembly.workflows = [];
      }

      file.assembly.workflows.push(
        {
          name: `${filename}.cs`
        }
      );
    }

    fs.writeFileSync(path.resolve(destinationPath, 'config.json'), JSON.stringify(file), 'utf8');
  }
}
