/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-27 20:28:44
 * @LastEditTime: 2023-07-27 21:11:36
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @FilePath: \pizza-server-AWS\spec\support\jasmine-runner.js
 * @Description: jasmine运行器
 */
const Jasmine = require('jasmine')
const SpecReporter = require('jasmine-spec-reporter').SpecReporter
const jrunner = new Jasmine() //创建一个jasmine实例
const path = require('path')
let filter //filter变量
//从执行的命令中获取除前两个参数外的所有参数，并循环遍历参数列表
process.argv.slice(2).forEach(option => {
    // 如果传递的参数已满，则删除默认报告器并添加jasmine spec报告器
    if (option === 'full') {
        jrunner.configureDefaultReporter({
            print() {}
        })
        jasmine.getEnv().addReporter(new SpecReporter())
    }
    // 如果传递的参数是过滤器，就将过滤器的值保存到filter变量中
    if (option.match('^filter=')) {
        filter = option.match('^filter=(.*)')[1]
    }
});
// 从jasmine.json加载配置文件
jrunner.loadConfigFile()
// 使用提供的过滤器启动jasmine运行器
jrunner.execute(undefined, filter)