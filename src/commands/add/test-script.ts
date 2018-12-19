import * as fs from 'fs';
import * as path from 'path';

export default async function test(filename: string) {
    write(filename);

    console.log();
    console.log(`added test script ${filename}.test.ts`);
}

function write(filename: string) {
    let destinationPath = process.cwd();
    let templatePath = path.resolve(__dirname, 'templates');

    // Check for folders and add if necessary
    if (!fs.existsSync(path.resolve(destinationPath, 'test'))) {
        fs.mkdirSync(path.resolve(destinationPath, 'test'));
    }

    if (!fs.existsSync(path.resolve(destinationPath, 'test', 'scripts'))) {
        fs.mkdirSync(path.resolve(destinationPath, 'test', 'scripts'));
    }

    // Check if file already exists
    if (fs.existsSync(path.resolve(destinationPath, 'test', 'scripts', `${filename}.test.ts`))) {
        console.log(`test script ${filename}.test.ts already exists`);
        return;
    }

    // Write script test file
    let content: string = fs.readFileSync(path.resolve(templatePath, 'test.ts'), 'utf8');
    
    content = content.replace(/<%= filename %>/g, filename);
    
    fs.writeFileSync(path.resolve(destinationPath, 'test', 'scripts', `${filename}.test.ts`), content);

    // Generate form mock
}
