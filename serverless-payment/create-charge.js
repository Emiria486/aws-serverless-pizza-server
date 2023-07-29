/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-29 18:35:08
 * @LastEditTime: 2023-07-29 20:14:04
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @FilePath: \serverless-payment\create-charge.js
 * @Description: 负责创建支付费用的业务逻辑
 */
const paymentRepository = require("./repositories/payment-repository")
const orderRepository = require("./repositories/order-reposityory")
module.exports = function (paymentRequest) {
    let paymentDescription = 'Pizza Order payment'  //提供收费说明
    return paymentRepository.createCharge(paymentRequest.token, paymentRequest.amount, paymentRequest.currency, paymentDescription) //调用createCharge函数
        .then(() => orderRepository.updateOrderStatus(paymentRequest.orderId))//调用createCharge函数成功后更新披萨订单支付状态
}