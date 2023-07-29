/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-26 16:38:08
 * @LastEditTime: 2023-07-27 08:37:25
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @FilePath: \sms-chatbot\handlers\save-address.js
 * @Description: 头部注释配置模板
 */
const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()

/**
 * Description 保存用户发来的地址
 * @param {any} order   用户订单
 * @param {any} message 用户sms消息
 * @returns {any}   更新后的订单数据
 */
function saveAddress(order, message) {
    return docClient.update({
            TableName: "pizza-orders",
            Key: {
                orderId: order.id
            },
            UpdateExpression: "set orderStatus =:o,address=:a",
            ExpressionAttributeValues: {
                ':o': "pending",
                ":a": message,
                text
            },
            ReturnValues: "UPDATED_NEW"
        })
        .promise()
}
module.exports = saveAddress