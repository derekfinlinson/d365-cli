const inquirer = require("inquirer"),    
    fs = require("fs"),
    path = require("path"),
    chalk = require("chalk");

function prompt() {
    console.log();
    console.log(chalk.green("Select script options"));
    console.log();

    const questions = [
        {
            type: 'list',
            name: 'type',
            message: 'Select script type:',
            choices: [
                {
                    name: 'Form Script',
                    value: 'form'
                },
                {
                    name: 'Ribbon Script',
                    value: 'ribbon'
                },
                {
                    name: 'Web Resource',
                    value: 'resource'
                }
            ]
        },
        {
            type: 'list',
            name: 'resourcetype',
            message: 'Select web resource type:',
            choices: [
                {
                    name: 'Angular',
                    value: 'angular'
                },
                {
                    name: 'React',
                    value: 'react'
                },
                {
                    name: 'TypeScript',
                    value: 'typescript'
                },
                {
                    name: 'Vue',
                    value: 'vue'
                }
            ],
            when: (answers) => {
                return answers.type === "resource"
            }
        },
        {
            type: 'input',
            name: 'filename',
            message: 'Script name:'
        },
        {
            type: 'input',
            name: 'name',
            message: 'Script unique name (including solution prefix):'
        },
        {
            type: 'input',
            name: 'displayName',
            message: 'Script display name:'
        }
    ];

    return inquirer.prompt(questions);
}

async function run () {
    const answers = await prompt();
}

module.exports = (...args) => {
    run(...args);
}
