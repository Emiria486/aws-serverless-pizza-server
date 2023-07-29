/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-26 16:37:50
 * @LastEditTime: 2023-07-26 22:26:27
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @FilePath: \sms-chatbot\handlers\order-pizz.js
 * @Description: 头部注释配置模板
 */
const AWS = require('aws-sdk')
const doClient = new AWS.DynamoDB.DocumentClient()
const uuid = require('uuid')

/**
 * Description 创建披萨订单
 * @param {any} pizza 用户选择的订单
 * @param {any} sender 用户的电话
 * @returns {any} 成功返回询问送货地址，错误返回重试提醒
 */
function orderPizza(pizza, sender) {
    return doClient.put({
            TableName: "pizza-orders",
            Item: {
                orderId: uuid(),
                pizza: pizza.id,
                orderStatus: 'in-progress',
                platform: 'twilio-sms-chatbot',
                user: sender
            }
        })
        .promise()
        .then(res => {
            return 'where do you want your pizza to be delivered?you can write your address'
        })
        .catch(err => {
            console.log(err)
            return [
                "oh! something went wrong.can you please try again?"
            ]
        })
}
module.exports = orderPizza