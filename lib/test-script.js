const fs = require("fs"),
    path = require("path"),
    chalk = require("chalk");

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
        console.log(chalk.red(`Test script ${filename}.test.ts already exists`));
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

    console.log();
    console.log(chalk.green(`Added test script ${filename}.test.ts`));
}

async function run(filename) {
    console.log();
    console.log(chalk.green(`Adding test script ${filename}.test.ts`));

    write(filename);
}

module.exports = (...args) => {
    run(...args);
}
