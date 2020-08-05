#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const child_process = require('child_process');
const path = require('path');
const chalk = require('chalk');
const { version } = require('../package.json');
const program = new Command();


const message = {
    startText: 'CodeTool v%s: begin to start',
    configFileNotExist: "configuration %s not exist，please check",
    envNameQuestion: "please input the environment you want to init:",
    envNameNotExist: "%s not exist, please input the correct environment name",
    fileNotChange: "[ ]%s notchanged",
    fileGenerate: "[+]%s generated",
    fileSkiped: "[ ]%s ...skiped",
    fileOverwrite: "[!]%s overwrite",
    fileOverwriteQuestion: "the file %s is already exist, do you want to overwrite？（Yes|No|Quit|All）",
    fileERR: "can't open the file %s",
};

program
    .name('ct env')
    .usage('<action>')
    .command('init')
    .description('Init all environment files')
    .action(init);

program
    .command('run')
    .description('Switch environment')
    .action(run);

program.parse(process.argv);

// 以下是被调用的函数
function init() {
    const originEnvPath = path.join(__dirname, 'environments');
    const configPath = path.join(originEnvPath, 'config.json');
    const projectRoot = path.resolve('./');
    const projectEnvPath = path.join(projectRoot, 'environments');
    // 项目中没有environments时，先创建文件夹
    if (!fs.existsSync(projectEnvPath)) {
        fs.mkdirSync('environments');
        const config = fs.readFileSync(configPath).toString();
        const envs = Object.keys(JSON.parse(config));
        for (let env of envs) {
            fs.mkdirSync(path.join(projectEnvPath, env));
        }
    }
    _copyFile(configPath, path.join(projectEnvPath, 'config.json'));



    // if (fs.existsSync(path.join(resultPath, 'environments'))) {
    //     console.log('');
    //     return;
    // }
    // copyFolder(copiedPath, resultPath);
}

function run(env) {
    if (!env) {
        // 询问
    }
    _printSucess('startText', version);
}

function _copyFolder(copiedPath, resultPath) {
    if (fs.existsSync(copiedPath)) {
        child_process.spawn('cp', ['-r', copiedPath, resultPath]);
    } else {
        console.log('do not exist path: ', copiedPath);
    }
}

function _copyFile(src, dest) {
    // 到这里了
    fs.copyFileSync(src, dest);

}

function _printSucess(type, args) {
    const text = _getMessage(type, args);
    return console.log(chalk.green(text));
}

function _printNormal(type, args) {
    const text = _getMessage(type, args);
    return console.log(text);
}

function _printError(type, args) {
    const text = _getMessage(type, args);
    return console.log(chalk.red(text));
}

function _getMessage(type, args) {
    const reg = /%s/ig;
    const types = Object.keys(message);
    if (!types.includes(type)) return '未知错误:' + type;
    return message[type].replace(reg, args);
}