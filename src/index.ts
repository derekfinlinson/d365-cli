#!/usr/bin/env node

import { program } from 'commander';
import add from './commands/add';
import create from './commands/create';
import deploy from './commands/deploy';

program
  .version(require('../package').version)
  .usage("<command> [options]");

// Create command
program
  .command("create <project>")
  .description("Create a new project (webresource, plugin, workflow, console)")
  .action((project) => {
    create(project);
  });

// Add command
program
  .command("add <type> <name>")
  .description("Add a new file (css, html, script, test-script, plugin, workflow)")
  .action((type, name) => {
    add(type, name);
  });

// Deploy command
program
  .command("deploy <type> [name]")
  .description("Deploy file(s) to D365 (webresource, plugin, workflow)")
  .action((type, name) => {
    deploy(type, name);
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
