/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-29 10:57:53
 * @LastEditTime: 2023-07-29 11:19:02
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @FilePath: \pizza-server-AWS\handler\Hex-orderRepository.js
 * @Description:数据库保存函数
 */
const AWS = require("aws-sdk")

orderRepository = () => {
    const tableName = 'pizza-orders'
    docClient = new AWS.DynamoDB.DocumentClient({ //初始化docClient类
        region: process.env.region
    })
    this.createOrder = (orderDate) => { //为orderRepository定义createOrder处理函数
        return docClient.put({ //调用docClient.put存储所需要的data
            tableName: tableName,
            Item: {
                cognitoUsername: orderDate.cognitoUsername,
                orderId: orderDate.deliveryId,
                pizza: orderDate.pizza,
                address: orderDate.address,
                orderStatus: orderDate.orderStatus
            }
        })
    }
}
module.exports = orderRepository