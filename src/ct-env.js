#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const child_process = require('child_process');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { version } = require('../package.json');
const program = new Command();

const message = {
    startText: 'CodeTool v%s: begin to start',
    configFileNotExist: "configuration %s not exist，please check",
    envNameQuestion: "please choose the environment you want to init:",
    fileNotChange: "[ ]%s not changed",
    fileGenerate: "[+]%s generated",
    fileSkiped: "[ ]%s ...skiped",
    fileOverwrite: "[!]%s overwrite",
    fileOverwriteQuestion: "the file %s is already exist, do you want to overwrite？",
    fileERR: "can't open the file %s",
};
let ifOverwrite = false;

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
    _printSucess('startText', version);
    const originEnvPath = path.join(__dirname, 'environments');
    const configFile = path.join(originEnvPath, 'config.json');
    const projectRoot = path.resolve('./');
    const projectEnvPath = path.join(projectRoot, 'environments');
    // 项目中没有environments时，先创建文件夹
    if (!fs.existsSync(projectEnvPath)) {
        fs.mkdirSync('environments');
        if (!fs.existsSync(configFile)) return _printDanger(configFileNotExist, configFile);
        const config = fs.readFileSync(configFile).toString();
        const envs = Object.keys(JSON.parse(config));
        for (let env of envs) {
            fs.mkdirSync(path.join(projectEnvPath, env));
        }
    }
    _copyFile(configFile, path.join(projectEnvPath, 'config.json'));
}

function run() {
    _printSucess('startText', version);
    const projectRoot = path.resolve('./');
    const projectEnvPath = path.join(projectRoot, 'environments');
    const configFile = path.join(projectEnvPath, 'config.json');
    const config = fs.readFileSync(configFile).toString();
    const envs = Object.keys(JSON.parse(config));
    inquirer.prompt([{
        type: 'list',
        name: 'env',
        message: _getMessage('envNameQuestion'),
        choices: envs
    }]).then(result => {
        console.log(1, result.env);
    });
    // _printSucess('startText', version);
}

function _copyFolder(copiedPath, resultPath) {
    if (fs.existsSync(copiedPath)) {
        child_process.spawn('cp', ['-r', copiedPath, resultPath]);
    } else {
        console.log('do not exist path: ', copiedPath);
    }
}

// 拷贝单个文件
function _copyFile(src, dest) {
    if (!fs.existsSync(src)) return _printDanger(fileERR, src);
    const str1 = fs.readFileSync(src).toString();
    // 文件已存在时候的判断
    if (fs.existsSync(dest)) {
        const str2 = fs.readFileSync(dest).toString();
        // 内容相同
        if (str1 === str2) {
            _printSucess('fileNotChange', dest);
            return true;
        }
        // 定义覆盖函数
        function overwrite() {
            fs.writeFileSync(dest, str1);
            _printDanger("fileOverwrite", dest);
            return true;
        }
        if (ifOverwrite) return overwrite();
        // 内容不同询问
        return inquirer.prompt([{
            type: 'list',
            name: 'ifOverwrite',
            message: _getMessage('fileOverwriteQuestion', dest),
            choices: ['Yes', 'No', 'Quit', 'All']
        }]).then(result => {
            let flag = false;
            switch (result.ifOverwrite) {
                case 'Yes':
                    flag = overwrite();
                    break;
                case 'No':
                    flag = true;
                    _printNormal("fileSkiped", dest);
                    break;
                case 'Quit':
                    flag = false;
                    _printNormal("fileSkiped", dest);
                    break;
                case 'All':
                    ifOverwrite = true;
                    flag = overwrite();
                    break;
                default:
                    break;
            }
            return flag;
        });
    }
    // 文件不存在时直接拷贝
    fs.copyFileSync(src, dest);
    return true;
}

// 各个打印函数
function _printSucess(type, args) {
    const text = _getMessage(type, args);
    return console.log(chalk.green(text));
}

function _printNormal(type, args) {
    const text = _getMessage(type, args);
    return console.log(text);
}

function _printDanger(type, args) {
    const text = _getMessage(type, args);
    return console.log(chalk.red(text));
}
// 获取信息
function _getMessage(type, args) {
    const reg = /%s/ig;
    const types = Object.keys(message);
    if (!types.includes(type)) return '未知错误:' + type;
    return message[type].replace(reg, args);
}