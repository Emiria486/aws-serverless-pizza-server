/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-17 20:17:26
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @LastEditTime: 2023-07-22 17:01:11
 * @FilePath: \pizza-server-AWS\api.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
'use strict'
const APi = require("claudia-api-builder")

const api = new APi()
const getPizzas = require('./handlers/get-pizzas')
const createOrder = require('./handlers/create-order')
const updateOrder = require('./handlers/update-order')
const deleteOrder = require('./handlers/delete-order')
const updateDeliveryStatus = require('./handlers/update-delivery-status')
const getSignedUrl = require('./handler/generate-presigned-url')
//注册自定义授权器
api.registerAuthorizer("userAuthentication", {
    providerARNs: [process.env.userPoolArn] //从环境变量中获取用户池ARNb并设置为提供者ARN
})
api.get('/', () => 'Welcome to Pizza API')

api.get("/pizzas", () => {
    return getPizzas()
})
api.get('/pizzas/{id}', request => {
    return getPizzas(request.pathParams.id)
}, {
    error: 404
})
api.post("/orders", (request) => {
    return createOrder(request)
}, {
    success: 201,
    error: 404,
}, {
    cognitoAuthorizer: "userAuthentication" //在特定路径上启用授权
})
api.put("/order/{id}", (request) => {
    return updateOrder(request.pathParams.id, request.body)
}, {
    error: 404,
}, {
    cognitoAuthorizer: "userAuthentication"
})
api.delete('/orders/{id}', (request) => {
    return deleteOrder(request.pathParams.id, request.context.authorizer.claims)
}, {
    error: 400,
}, {
    cognitoAuthorizer: "userAuthentication"
})

api.post('delivery', request => {
    return updateDeliveryStatus(request.body)
}, {
    success: 200,
    error: 400,
}, {
    cognitoAuthorizer: "userAuthentication"
})
api.get('upload-url', request => {
    return getSignedUrl()
}, {
    error: 404
}, {
    cognitoAuthorizer: "userAuthentication" //在特定路径上启用授权
})
module.exports = api