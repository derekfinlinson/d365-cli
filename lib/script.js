const inquirer = require("inquirer"),    
    fs = require("fs"),
    path = require("path"),
    chalk = require("chalk");

function run (name) {
    console.log();
    console.log(chalk.green("Select script options"));
    console.log();   
}

module.exports = (...args) => {
    run(...args);
}
