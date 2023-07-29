/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-29 18:34:57
 * @LastEditTime: 2023-07-29 19:35:02
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @FilePath: \serverless-payment\payment.js
 * @Description: 主服务文件，使用API builder 构建一个公开的post节点
 */
const ApiBuilder = require('claudia-api-builder')
const api = new ApiBuilder()
const createCharge = require("./create-charge")
const paymentRepository = require("./repositories/payment-repository")

api.post("/create-charge", request => { //创建订单的API
    let paymentRequest = { //创建参数对应，以供createCharger方法使用
        token: request.body.key,
        amount: request.body.amount,
        currency: request.body.currency,
        orderId: request.body.metadata
    }
    return createCharge(paymentRequest) //调用createCharge方法
        .then(charge => { // 如果成功了，发送成功信息
            return {
                message: "Payment Initiated!",
                charge: charge
            }
        }).catch(err => { //在出现错误的情况下，返回带有错误的消息
            return {
                message: 'Payment Initialization Error',
                error: err
            }
        })
})
api.get("/charges", request => { //设置获得所有支付订单的api端点
    return paymentRepository.getAllCharges() //调用getAllCharges方法，得到支付列表数据
        .catch(err => { //如果不超过，发送错误
            return {
                message: 'Charges Listing Error',
                error: err
            }
        })
})
module.exports = api