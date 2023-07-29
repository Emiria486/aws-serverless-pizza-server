/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-27 22:26:09
 * @LastEditTime: 2023-07-29 08:44:22
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @FilePath: \pizza-server-AWS\spec\handlers\create-order.spec.js
 * @Description: 对create-order函数的单元测试
 */
const underTest = require("../../handler/create-order")
const https = require('https')
const faeHttpRequest = require("fake-http-request")
const AWS = require("aws-sdk")
const fakeHttpRequest = require("fake-http-request")
let docClientMock

describe('Create order handler', () => {
    beforeEach(() => { //在每个spec执行前执行一些操作
        fakeHttpRequest.install('https') //在https上安装fake-http-request库
        docClientMock = jasmine.createSpyObj('docClient', {
            put: {
                promise: Promise.resolve.bind(Promise) //模拟输入和配置函数
            },
            configure() {}
        })
        AWS.DynamoDB.DocumentClient.prototype = docClientMock //使用jasmine spy 替换DocumentClient类
    })
    afterEach(() => faeHttpRequest.uninstall("https")) //在每个spec执行后执行一些操作，卸载fake-http-request库

    // 1.检查不合格请求是否触发异常
    it('should throw an error if request is not valid', () => {
        expect(() => underTest()).toThrow()
        expect(() => underTest({})).toThrow()
        expect(() => underTest('A')).toThrow()
        expect(() => underTest(1)).toThrow()
        expect(() => underTest({
            body: {}
        })).toThrow()
        expect(() => underTest({
            body: {
                pizza: 1
            }
        })).toThrow()
        expect(() => underTest({
            body: {
                address: '221b Baker Street'
            }
        })).toThrow()
    })
    // 2.是否将post请求发送给第三方api
    it('should send post request to Some Like It Hot delivery API', (done) => { //调用正在测试的处理函数
        underTest({
            body: {
                pizza: 1,
                address: '221b Baker Street'
            }
        })
        https.request.pipe((callOption) => { //使用fake-https-request向http.request添加pipe方法，可以使用pipe方法检查https请求是否使用期望值发送
            expect(https.request.calls.length).toBe(1) //检查是否只发送了一个请求
            expect(callOption).toEqual(jasmine.objectContaining({ //使用jasmine.objectContaining比较，对callOption请求与预期对象进行比较
                protocol: "https",
                slashes: true,
                host: 'some-like-it-hot-api.effortlessserverless.com',
                path: "/delivery",
                method: post,
                headers: {
                    Authorization: 'aunt-marias-pizzeria-1234567890',
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    pickupTime: '15.34pm',
                    pickupAddress: 'Aunt Maria Pizzeria',
                    deliveryAddress: '221b Baker Street',
                    webhookUrl: 'https://g8fhlgccof.execute-api.eu-central-1.amazonaws.com/latest/delivery'
                })
            }))
            done() //告诉jasmine异步spec已经完成
        })
    })
    // 3.测试docClient是否在http请求后调用
    it('should call the DynamoDB DocumentClient.put if Some Like It Hot delivery API request was successful', (done) => {
        underTest({
                body: {
                    pizza: 1,
                    address: '221b Baker Street'
                }
            })
            .then(() => {
                expect(docClientMock.put).toHaveBeenCalled() //检查如果函数成功解决，docClientMock.put是否被调用
                done() //告诉jasmine异步spec已经完成
            })
            .catch(done.fail) //告诉jasmine，如果函数被拒绝，异步spec失败
        // 为了测试需要，通过在pipe方法中添加模拟第三方api成功的响应
        https.request.pipe((callOption) => https.request.calls[0].respond(200, "OK", "{}"))
    })
    // 4.测试如果http请求失败，docClient模拟将不会被调用
    it('should not call the DynamoDB DocumentClient.put if Some Like It Hot delivery API request was not successful', (done) => {
        underTest({
                body: {
                    pizza: 1,
                    address: '221b Baker Street'
                }
            })
            // 告诉jasmine，如果函数向下进一步运行，说明异步测试就失败了
            .then(done.fail)
            .catch(() => {
                // 检查如果进一步运行被拒绝，docClientMock.put不会被调用
                expect(docClientMock.put).not.toHaveBeenCalled()
                // 异步测试完成
                done()
            })
        // 模拟外部api调用失败
        https.request.pipe((callOption) => https.request.calls[0].respond(500, 'Server error', '{}'))
    })
    // 5.测试函数在前置请求一切顺利的情况下最后是否成功返回resolve的Promise
    it('should resolve the promise if everything went fine', () => {
        underTest({
                body: {
                    pizza: 1,
                    address: '221b Baker Street'
                }
            })
            .then(done) //异步完成
            .catch(done.fail) //程序抛出异常，就通知jasmine异步测试失败
        https.request.pipe((callOptions) => https.request.calls[0].respond(200, 'Ok', '{}'))
    })
    // 6.测试函数在前置请求不成功的情况下最后是否成功返回reject的Promise
    it('should reject the promise if something went wrong', (done) => {
        underTest({
                body: {
                    pizza: 1,
                    address: "221b Baker Street"
                }
            })
            .then(done.fail) //程序进入resolve，通知jasmine异步测试失败
            .catch(done) //测试成功完成
        https.request.pipe((callOptions) => https.request.calls[0].respond(500, 'Server Error', '{}'))

    })
})