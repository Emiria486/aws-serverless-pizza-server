/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-29 10:37:16
 * @LastEditTime: 2023-07-29 11:16:53
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @FilePath: \pizza-server-AWS\handler\Hex-create-order.js
 * @Description: 使用六角架构（Hexagonal Architecture）优化的订单保存处理程序
 */
function HexCreateOrder(request, orderRepository) {
    // 移除了AWS DynamoDB 初始化的代码，因为这部分的代码已经移到orderRepository
    let userAddress = request && request.body && request.body.address
    if (!userAddress) {
        const userData = request && request.context && request.context.authorizer && request.context.authorizer.claims
        if (!userData) {
            throw new Error("'To order pizza please provide pizza type and address where pizza should be delivered")
        }
        userAddress = JSON.parse(userData.address)
    }
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
        .then(rawResponse => JSON.parse(rawResponse))
        .then(response => {
            orderRepository.createOrder({
                cognitoUsername: request.cognitoUsername,
                orderId: response.deliveryId,
                pizza: request.body.pizza,
                address: userAddress,
                orderStatus: 'pending'
            }).promise()
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
module.exports=HexCreateOrder