const AWS = require('aws-sdk')
const doClient = new AWS.DynamoDB.DocumentClient()
const rp = require('minimal-request-promise')

/**
 * Description 向第三方平台发送快递请求并向数据库更新用户订单地址
 * @param {any} userId 用户id
 * @param {any} coordinates 用户地址
 * @returns {any} 更新后的数据库订单条目
 */
function saveLocation(userId, coordinates) {
    return doClient.scan({ //扫描订单表
            TableName: "pizza-orders",
            Limit: 1, //将结果限制为一条
            FilterExpression: `#user=:u and orderStatus=:s`, //仅搜索具有指定状态的所选用户发送的订单
            ExpressionAttributeNames: {
                '#user': 'user'
            },
            ExpressionAttributeValues: {
                ':u': userId,
                ':s': 'in-progress'
            }
        })
        .promise()
        .then(result => result.Items[0]) //获取响应的第一个条目
        .then(order => { //将第三方快递平台发起快递订单请求
            return rp.post('https://some-like-it-hot-api.effortless-serverless.com/delivery', {
                    headers: {
                        "Authorization": "aunt-marias-pizzeria-1234567890",
                        "content-type": "application/json"
                    },
                    body: JSON.stringify({
                        pickupTime: '15.34pm',
                        pickupAddress: 'Aunt Maria Pizzeria',
                        deliveryCoords: coordinates,
                        webhookUrl: 'https://g8fhlgccof.execute-api.eu-central-1.amazonaws.com/latest/delivery', //webhook用于更新订单状态
                    })
                })
                .then(rawResponse => JSON.parse(rawResponse.body)) //得到第三方响应信息并解析
                .then(response => {
                    // 向order对象新增deliveryId属性
                    order.deliveryId = response.deliveryId
                    return order
                })
        })
        // 向数据库更新数据
        .then(order => {
            return doClient.update({
                TableName: "pizza-orders",
                Key: {
                    orderId: order.orderId
                },
                UpdateExpression: "set orderStatus=:s,coords=:c,deliveryId=:d",
                ExpressionAttributeValues: {
                    ':s': "pending",
                    ":c": coordinates,
                    ":d": order.deliveryId
                },
                ReturnValues: "ALL_NEW"
            }).promise()
        })
}
module.exports = saveLocation