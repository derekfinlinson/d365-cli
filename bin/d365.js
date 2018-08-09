#!/usr/bin/env node

"use strict";

const program = require("commander"),
    boxen = require("boxen"),
    chalk = require("chalk");

console.log(boxen(chalk.blue.bold("Dynamics 365 CLI"), { padding: 1, borderStyle: "classic", backgroundColor: "white"}));

// Add empty line
console.log();

program
    .version(require('../package').version)
    .usage("<command> [options]");

// Create command
program
    .command("create <project>")
    .description("Create a new project")
    .action((project) => {
        require("../lib/create")(project);
    });

// Add command
program
    .command("add <type> <name>")
    .description("Add a new file")
    .action((type, name) => {
        require("../lib/add")(type, name);
    });

// Show help on unknown command
program
  .arguments('<command>')
  .action((cmd) => {
    program.outputHelp();
    console.log();
    console.log(chalk.red(`Unknown command ${chalk.yellow(cmd)}.`));
    console.log();
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}

