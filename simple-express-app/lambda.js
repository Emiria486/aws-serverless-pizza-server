/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-29 20:47:05
 * @LastEditTime: 2023-07-29 22:09:38
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @FilePath: \simple-express-app\lambda.js
 * @Description: 用于express应用的aws lambda封装器,会在aws lambda中运行express应用，理论上使用claudia generate-serverless-express-proxy命令可以自动生成
 */
const awsServerlessExpress = require("aws-serverless-express")
const app = require('./app')
const binaryMineTypes = [   //白名单，mime类型将被转换并传递给express应用
    'application/octet-stream',
    'font/eot',
    'font/opentype',
    'font/otf',
    'image/jpeg',
    'image/png',
    'image/svg+xml'
]
const server = awsServerlessExpress.createServer(app, null, binaryMineTypes)    //首先使用createServer函数启动express应用中的lambda函数
exports.handler = (event, context) => awsServerlessExpress.proxy(server, event, context)    //  使用proxy函数将API gateway请求转为http请求并传递给express应用，转换响应后传递回API gateway