#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const fse = require('fs-extra');
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
let ifQuit = false;

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

// 初始化命令
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
            env = path.join(projectEnvPath, env);
            fs.mkdirSync(env);
            _printSucess('fileGenerate', env);
        }
    }
    _copyFile(configFile, path.join(projectEnvPath, 'config.json'));
}

// 切换环境命令
async function run() {
    _printSucess('startText', version);
    const projectRoot = path.resolve('./');
    const projectEnvPath = path.join(projectRoot, 'environments');
    const configFile = path.join(projectEnvPath, 'config.json');
    const config = fs.readFileSync(configFile).toString();
    const envs = Object.keys(JSON.parse(config));
    let envResult = await inquirer.prompt([{
        type: 'list',
        name: 'env',
        message: _getMessage('envNameQuestion'),
        choices: envs
    }]);
    const srcFolder = path.join(projectEnvPath, envResult.env);
    const fileList = _getFileList(srcFolder);
    for (let file of fileList) {
        await _copyFile(path.join(srcFolder, file), path.join(projectRoot, file));
    }
}

/**
 * 拷贝单个文件
 * params src  源文件
 * params dest 目标文件
 * return promise
 * promise.then(data => data) 验证拷贝是否成功
 */
async function _copyFile(src, dest) {
    if (ifQuit) return false;
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
        let overwriteResult = await inquirer.prompt([{
            type: 'list',
            name: 'ifOverwrite',
            message: _getMessage('fileOverwriteQuestion', dest),
            choices: ['Yes', 'No', 'Quit', 'All']
        }]);
        let flag = false;
        switch (overwriteResult.ifOverwrite) {
            case 'Yes':
                flag = overwrite();
                break;
            case 'No':
                flag = true;
                _printNormal("fileSkiped", dest);
                break;
            case 'Quit':
                flag = false;
                ifQuit = true;
                break;
            case 'All':
                ifOverwrite = true;
                flag = overwrite();
                break;
            default:
                break;
        }
        return flag;
    }
    // 文件不存在时直接拷贝 这里使用了fse是因为当dest路径不存在时fse可以自动创建路径
    fse.copySync(src, dest);
    _printSucess('fileGenerate', dest);
    return true;
}

// 遍历获取文件列表
function _getFileList(src, father = '') {
    let files = fs.readdirSync(src);
    files = files.map(file => {
        let filePath = path.join(src, file);
        let fileInfo = fs.statSync(filePath);
        if (fileInfo.isDirectory()) return _getFileList(filePath, father + file + '/');
        return father + file;
    });
    // flat方法在node环境下的兼容性有问题
    function flatDeep(arr, d = 1) {
        return d > 0 ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val), []) :
            arr.slice();
    };
    return flatDeep(files, Infinity);
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
// 获取提示信息
function _getMessage(type, args) {
    const reg = /%s/ig;
    const types = Object.keys(message);
    if (!types.includes(type)) return '未知错误:' + type;
    return message[type].replace(reg, args);
}