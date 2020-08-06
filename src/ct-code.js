#!/usr/bin/env node

const inquirer = require('inquirer');
console.log('code');
test();



async function test() {
    let a = await inquirer.prompt([{
        type: 'list',
        name: 'start',
        message: 'If you want start?',
        choices: ['yes', 'no']
    }]);
    console.log(a);
    let arr = [1, 2, 3, 4];
    for (let index of arr) {
        await copy(index);
    }
}

function copy(index) {
    return inquirer.prompt([{
        type: 'list',
        name: 'env',
        message: 'choose env',
        choices: ['dev', 'prod', 'staging']
    }]).then(result => {
        console.log(index, result.env);
    });
}