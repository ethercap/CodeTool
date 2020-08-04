#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();

program
    // ct help env 的提示信息还有点问题
    .usage('<command> [option]')
    .option('-f, --force', 'force do it');

program.parse(process.argv);

const pkgs = program.args;
console.log(pkgs);