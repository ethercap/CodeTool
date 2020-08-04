#!/usr/bin/env node

const { Command } = require('commander');
const { version, description } = require('../package.json');
const program = new Command();

program
    .version(version)
    .description(description);

program
    .usage('<command> [option]')
    .command('env <action>', 'handlers of environment', { executableFile: 'env' }).alias('e')
    .command('code <type>', 'create a type of code automatically', { executableFile: 'code' }).alias('c')
    .command('test <type>')
    .description('test function')
    .action((a, b, c) => {
        console.log(a, b, c);
    });

// 丰富帮助信息
program.on('--help', () => {
    console.log('');
    console.log('Example call:');
    console.log('  $ ct env init');
});

program.parse(process.argv);