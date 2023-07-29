/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-27 22:17:03
 * @LastEditTime: 2023-07-29 08:42:44
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @FilePath: \pizza-server-AWS\spec\handlers\create-order-integration.spec.js
 * @Description: 为createOrder处理函数的集成测试
 */
const underTest = require("../../handler/create-order")
const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB({ //创建dynamodb类的实例
    apiVersion: "2023-7-28",
    region: "eu-central-1"
})
const https = require('https')
const fakeHttpRequest = require("fake-http-request")

const tableName = `pizzaOrderTest${new Date().getTime()}` //生产测试dynamodb表名
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000 //将jasmine运行器的超时时间

describe("Create Order (integration)", () => {
    beforeAll((done) => { //进行所有测试之前创建dynamodb表
        const params = { //设置dynamodb表配置
            AttributeDefinitions: [{ //表的属性
                AttributeName: "orderId",
                AttributeType: "S" //字符串属性
            }],
            KeySchema: [{ //将orderId设置为主键
                AttributeName: "orderId",
                KeyType: "HASH"
            }],
            ProvisionedThroughput: { //控制读写容量都为1，可以满足测试需要了
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
            },
            tableName: tableName //设置表名
        }
        // 在所有spec之前创建新的dynamodb表
        dynamodb.createTable(params).promise()
            .then(() => dynamodb.waitFor('tableExists', { //使用waitFor方法确保表在jasmine done回调之前存在
                tableName: tableName
            }).promise())
            .then(done) //     异步完成，成功
            .catch(done.fail) //创建失败，通知jasmine异步失败
    })
    afterAll(done => {
        dynamodb.deleteTable({
                TableName: tableName
            }).promise()
            .then(() => dynamodb.waitFor("tableNotExists", { //使用waitFor方法确保表在jasmine done回调之后销毁
                TableName: tableName
            }).promise())
            .then(done)
            .catch(done.fail)
    })

    beforeEach(() => fakeHttpRequest.install({
        type: "https",
        matcher: /some-like-it-hot-api/
    }))
    afterEach(() => fakeHttpRequest.uninstall('https'))

    it('should save the order in the DynamoDB table if Some Like It Hot delivery API request was successful', (done) => {
        underTest({
                body: {
                    pizza: 1,
                    address: '221b Baker Street'
                }
            }, tableName)
            .then(rawResponse => JSON.parse(rawResponse.body))
            .then(response => {
                const params = {
                    Key: {
                        orderId: {
                            S: response.deliveryId
                        }
                    },
                    TableName: tableName
                }
                dynamodb.getItem(params).promise() //从测试数据库中通过id获取条目
                    .then(result => {
                        console.log(result)
                        // 检查数据库中的数据是否正确，并将测试标记为已完成
                        expect(result.Item.orderId.S).toBe(response.deliveryId)
                        expect(result.Item.address.S).toBe('221b Baker Street')
                        expect(result.Item.pizza.N).toBe('1')
                        done()
                    })
                    .catch(done.fail)   //被拒绝，就把测试标记为失败
            })
            .catch(done.fail)
        // 模拟第三方api的成功响应并返回交付id
        https.request.pipe((callOptions) => https.request.calls[0].respond(200, 'Ok', JSON.stringify({
            deliveryId: 'order-id-from-delivery-api'
        })))
    })

})