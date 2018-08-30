const fs = require("fs");
const path = require("path");

function write(filename) {
    let destinationPath = process.cwd();
    let templatePath = path.resolve(__dirname, "templates", "add");

    // Check for folders and add if necessary
    if (!fs.existsSync(path.resolve(destinationPath, 'test'))) {
        fs.mkdirSync(path.resolve(destinationPath, 'test'));
    }

    if (!fs.existsSync(path.resolve(destinationPath, 'test', 'scripts'))) {
        fs.mkdirSync(path.resolve(destinationPath, 'test', 'scripts'));
    }

    // Check if file already exists
    if (fs.existsSync(path.resolve(destinationPath, 'test', 'scripts', `${filename}.test.ts`))) {
        console.log(`Test script ${filename}.test.ts already exists`);
        return;
    }

    // Write script test file
    fs.copyFileSync(path.resolve(templatePath, 'test.ts'), path.resolve(destinationPath, 'test', 'scripts', `${filename}.test.ts`));

    require('replace-in-file').sync({
        files: path.resolve(destinationPath, 'test', 'scripts', `${filename}.test.ts`),
        from: /<%= filename %>/g,
        to: filename
    });

    // Generate form mock
}

async function run(filename) {
    write(filename);

    console.log();
    console.log(`Added test script ${filename}.test.ts`);
}

module.exports = (...args) => {
    run(...args);
}
