const fs = require('fs'),
      path = require('path'),
      replace = require('replace-in-file');

function write(filename) {
    let destinationPath = process.cwd();
    let templatePath = path.resolve(__dirname, 'templates', 'add');

    // Check if file already exists
    if (fs.existsSync(path.resolve(destinationPath, `${filename}.cs`))) {
        console.log(`Plugin ${filename} already exists`);
        return;
    }

    filename = filename.replace('.cs', '');

    fs.copyFileSync(path.resolve(templatePath, 'plugin.cs'), path.resolve(destinationPath, `${filename}.cs`));

    let config;

    // Read namespace from .d365rc file
    if (fs.existsSync(path.resolve(destinationPath, '.d365rc'))) {
        config = JSON.parse(fs.readFileSync(path.resolve(destinationPath, '.d365rc'), 'utf8'));
    } else if (fs.existsSync(path.resolve(destinationPath, '..', '.d365rc'))) {
        config = JSON.parse(fs.readFileSync(path.resolve(destinationPath, '..', '.d365rc'), 'utf8'));
    } else if (fs.existsSync(path.resolve(destinationPath, '..', '..', '.d365rc'))) {
        config = JSON.parse(fs.readFileSync(path.resolve(destinationPath, '..', '..', '.d365rc'), 'utf8'));
    }

    if (config != null) {
        let namespace = config.namespace;

        // Replace namespace if .d365rc file found
        if (path.basename(destinationPath) !== config.namespace) {
            namespace = `${config.namespace}.${path.basename(destinationPath)}`;    
        }

        replace.sync({
            files: path.resolve(destinationPath, `${filename}.cs`),
            from: '<%= namespace %>',
            to: namespace
        });
    } else {
        replace.sync({
            files: path.resolve(destinationPath, `${filename}.cs`),
            from: '<%= namespace %>',
            to: path.basename(destinationPath)
        });
    }

    replace.sync({
        files: path.resolve(destinationPath, `${filename}.cs`),
        from: '<%= name %>',
        to: filename
    });
}

async function run(filename) {
    write(filename);

    console.log();
    console.log(`Added plugin ${filename}.cs`);
    console.log();
}

module.exports = (...args) => {
    run(...args);
}
