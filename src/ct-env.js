#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();

program
    .name('ct env')
    .usage('<action>')
    // action 到底是以command的形式存在 还是以option的形式存在？？
    .command('init')
    .description('Init all environment files')
    .action(() => {
        console.log('在这里写复制逻辑');
    });

program
    .command('run')
    .description('switch environment')
    .action(() => {
        console.log('在这里写切换逻辑');
    });

program.parse(process.argv);