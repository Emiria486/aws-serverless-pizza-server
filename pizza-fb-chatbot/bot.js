/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-23 10:44:34
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @LastEditTime: 2023-07-25 21:54:56
 * @FilePath: \pizza-fb-chatbot\bot.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const botBuilder = require('claudia-bot-builder')

const pizzaDetails = require('./handlers/pizz-details')
const orderPizza = require('./handlers/order-pizza')
const pizzaMenu = require('./handlers/pizza-menu')
const saveLocation = require('./handlers/save-location')
const getLastPizza = require("./handlers/save-last-pizza")
const deliveryWebhook = require('./handlers/delivery-webhook')

const api = botBuilder(message => {
    if (message.postback) { //检查是否为回传信息
        const [action, pizzaId] = message.text.split('|') //如果是，拆分文本数字获得动作和披萨id
        if (action === 'DETAILS') {
            return pizzaDetails(pizzaId)
        } else if (action === 'ORDER') {
            return orderPizza(pizzaDetails, message.sender)
        }
    }
    // 检查客户是否共享了他们的位置
    if (message.originalRequest.message.attachments &&
        message.originalRequest.message.attachments.length &&
        message.originalRequest.message.attachments[0].payload.coordinates &&
        message.originalRequest.message.attachments[0].payload.coordinates.lat &&
        message.originalRequest.message.attachments[0].payload.coordinates.long) {
        // 使用发送者id和坐标调用保存坐标函数
        return saveLocation(message.sender, message.originalRequest.message.attachments[0].payload.coordinates)
    }
    // 检查是否存在nlp密钥以及实体，并在其中包含thanks实体
    if (message.originalRequest.message.nlp &&
        message.originalRequest.message.nlp.entities &&
        message.originalRequest.message.nlp.entities['thanks'] &&
        message.originalRequest.message.nlp.entities['thanks'].length &&
        // 在确信值大于0.8是启动
        message.originalRequest.message.nlp.entities['thanks'][0].confidence > 0.8) {
        return `You're welcome!`
    }
    // 搜索客户最后一个披萨数据
    return getLastPizza(message.sender).then(lastPizza => {
        let lastPizzaText = lastPizza ? `glad to have you back! Hope you liked your ${lastPizza.name} pizza` : ''
        return [
            `Hello, ${lastPizzaText} here's our pizza menu:`,
            pizzaMenu()
        ]
    })
}, {
    platforms: ['facebook']
})

//订单状态的更新
/* 
    claudia bot builder会调出claudia API builder的实例，所以api可以返回API builder的全功能实例
*/
api.post('/delivery', request => deliveryWebhook(request.body, request.env.request.env.facebookAccessToken), {
    success: 200,
    error: 400
})

module.exports = api