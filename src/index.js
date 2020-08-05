#!/usr/bin/env node

const { Command } = require('commander');
const { version, description } = require('../package.json');
const program = new Command();

program
    .version(version)
    .description(description);

program
    .usage('<command> <action> [option]')
    .command('env <action>', 'handlers of environment').alias('e')
    .command('code <type>', 'create a type of code automatically').alias('c')

// 丰富帮助信息
program.on('--help', () => {
    console.log('');
    console.log('Example call:');
    console.log('  $ ct env init');
    console.log('  $ ct env run');
});

program.parse(process.argv);