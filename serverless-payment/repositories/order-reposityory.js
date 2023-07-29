/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-29 18:35:45
 * @LastEditTime: 2023-07-29 20:11:26
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @FilePath: \serverless-payment\repositories\order-reposityory.js
 * @Description: 负责与AWS DynamoDB通信，并且使用新处理后的付款消息更新披萨订单
 */
const AWS = require("aws-sdk")
const doClient = new AWS.DynamoDB.DocumentClient()
module.exports = {
    updateOrderStatus: function (orderId) {
        return doClient.put({
            TableName: 'pizza-orders',
            Key: {
                orderId: orderId
            },
            UpdateExpression: 'set orderStatus = :s',
            ExpressionAttributeValues: {
                ':s': 'paid'
            }
        }).promise()
    }
}