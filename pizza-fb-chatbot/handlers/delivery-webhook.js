/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-25 16:56:10
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @LastEditTime: 2023-07-25 21:08:29
 * @FilePath: \pizza-fb-chatbot\handler\delivery-webhook.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const reply = require('claudia-bot-builder/lib/facebook/reply') //导入回复功能
const AWS = require('aws-sdk')
const doClient = new AWS.DynamoDB.DocumentClient()

/**
 * Description 创建处理函数，接收请求对象和访问令牌作为参数
 * @param {any} request 请求参数
 * @param {any} facebookAccessToken 访问令牌
 * @returns {any} facebook messenger 回复
 */
function deliveryWebhook(request, facebookAccessToken) {
    if (!request.deliveryId || !request.status) {
        throw new Error('Status and delivery ID are required')
    }
    return doClient.scan({
            TableName: 'pizza-orders',
            Limit: 1,
            FilterExpression: 'deliveryId=:d',
            ExpressionAttributeValues: {
                ':d': {
                    S: request.deliveryId
                }
            }
        })
        .promise()
        .then(result => result.Items[0])
        .then(order => {
            return doClient.update({
                TableName: 'pizza-orders',
                Key: {
                    orderId: order.orderId
                },
                UpdateExpression: "set orderStatus=:s",
                ExpressionAttributeValues: {
                    ':s': request.status
                },
                ReturnValues: "ALL_New"
            }).promise()
        })
        .then(order => {
            //reply通过提供用户ID，信息和facebook messengerToken来回复客户
            return reply(order.user, `The status of your delivery is updated to: ${order.status}.`, facebookAccessToken)
        })
}
module.exports = deliveryWebhook