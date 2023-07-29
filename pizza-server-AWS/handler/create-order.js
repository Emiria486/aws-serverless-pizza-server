/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-17 21:19:47
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @LastEditTime: 2023-07-29 08:21:33
 * @FilePath: \pizza-server-AWS\handler\create-order.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-17 21:19:47
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @LastEditTime: 2023-07-19 10:10:31
 * @FilePath: \pizza-server-AWS\handler\create-order.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
'use strict'
//导入aws-sdk 并初始化DocumentClient类
const AWS = require('aws-sdk')
const rp = require("minimal-request-promise")

/**
 * Description 保存披萨订单函数，向第三方外卖平台提交订单并保存订单到数据库
 * @param {any} request  用户请求对象
 * @param {any} tableName  订单存储的数据库名
 * @returns {any} 成功返回保存promise响应，失败抛出异常
 */
function saveOrder(request, tableName = 'pizza-orders') {
  const docClient = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_DEFAULT_REGION
  })
  const userDate = request.context.authorizer.claims //从上下文对象中获取授权顺序添加的用户数据，然后进行记录
  let userAddress = request.body && request.body.address //默认情况下，使用请求正文中的地址
  if (!userAddress) {
    //如果未提供地址，使用用户的默认地址
    userAddress = JSON.parse(userDate.address)
  }
  if (!request || !request.body.pizza || !userAddress)
    throw new Error('To order pizza please provide pizza type and address where pizza should be delivered')

  return rp.post("https://fake-delivery-api.effortlessserverless.com/delivery", {
      headers: {
        Authorization: 'aunt-marias-pizzeria-1234567890',
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        pickupTime: '15.34pm',
        pickupAddress: 'Aunt Maria Pizzeria',
        deliveryAddress: userAddress,
        webhookUrl: 'https://g8fhlgccof.execute-api.eu-central-1.amazonaws.com/latest/delivery', //用于发送传递状态更新
      })
    })
    //先向外部api发送请求后再进行本地api处理
    .then(rawResponse => {
      JSON.parse(rawResponse)
    })
    .then(response => {
      return docClient.put({
          TableName: tableName,
          Item: {
            cognitoUsername: userAddress['cognito:username'], //将用户名从Cognito保存到数据库中
            orderId: response.deliveryId,
            pizza: request.body.pizza,
            address: userAddress,
            orderStatus: 'pending'
          }
        })
        .promise()
    })
    .then(res => {
      console.log('Order is saved!', res)

      return res
    })
    .catch(saveError => {
      console.log(`Oops, order is not saved :(`, saveError)
      throw saveError
    })
}

module.exports = saveOrder