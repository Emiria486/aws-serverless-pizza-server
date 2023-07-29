/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-26 16:36:39
 * @LastEditTime: 2023-07-27 08:26:27
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @FilePath: \sms-chatbot\handlers\check-order-progress.js
 * @Description: 头部注释配置模板
 */
const AWS = require('aws-sdk')
const doClient = new AWS.DynamoDB.DocumentClient()

/**
 * Description 查看披萨准备状态
 * @param {any} sender 用户电话
 * @returns {any}   成功返回用户披萨消息，没有查询到披萨返回undefined，发送错误发挥提示语句
 */
function checkProgressOrder(sender) {
    return doClient.scan({
            FilterExpression: "user=:user and orderStatus",
            ExpressionAttributeValues: {
                ":user": sender,
                ":status": 'in-progress'
            },
            Limit: 1,
            TableName: "pizza-orders"
        })
        .promise()
        .then(result => {
            if (result.Items && result.Items.length > 0) {
                return result.Items[0]
            } else {
                return undefined
            }
        })
        .catch(err => {
            console.log(err)
            return [
                'Oh! Something went wrong. Can you please try again?'
            ]
        })
}
module.exports = checkProgressOrder