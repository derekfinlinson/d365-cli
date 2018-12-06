#!/usr/bin/env node

"use strict";

const program = require("commander");

program
    .version(require('../package').version)
    .usage("<command> [options]");

// Create command
program
    .command("create <project>")
    .description("Create a new project (webresource, plugin, workflow)")
    .action((project) => {
        require("../lib/create")(project);
    });

// Add command
program
    .command("add <type> <name>")
    .description("Add a new file (css, html, script, test-script, plugin, workflow)")
    .action((type, name) => {
        require("../lib/add")(type, name);
    });

// Show help on unknown command
program
  .arguments('<command>')
  .action((cmd) => {
    program.outputHelp();
    console.log();
    console.log(`Unknown command ${cmd}.`);
    console.log();
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}

