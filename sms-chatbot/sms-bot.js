/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-26 15:41:01
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @LastEditTime: 2023-07-27 09:12:33
 * @FilePath: \sms-chatbot\sms-bot.js
 * @Description: 这是sms聊天机器人的入口文件
 */
const botBuilder = require('claudia-bot-builder')
const pizzas = require('./data/pizzas.json')
const pizzaMenu = require('./handlers/pizza-menu')
const orderPizza = require('./handlers/order-pizz')
const checkOrderProgress = require('./handlers/check-order-progress')
const saveAddress = require('./handlers/save-address')

const api = botBuilder((message, originalApiRequest) => {
    // 定义用户选择的披萨
    let chosenPizza
    pizzas.forEach(pizza => {
        // 检查用户发来的消息是否有披萨的简称，如果确定选择披萨并赋值
        if (message.text.indexOf(pizza.shortCode) != -1) {
            chosenPizza = pizza
        }
    })
    // 如果有选中的披萨，为其订购披萨
    if (chosenPizza) {
        return orderPizza(chosenPizza, message.sender)
    }
    // 假如不是包含披萨名称的短信，调用检查订单准备状态的程序
    return checkOrderProgress(message.sender)
        .then(orderInProgress => {
            if (orderInProgress) {  //假如有订单那么说明这是用户发送的地址信息，调用保存地址函数
                return saveAddress(orderInProgress, message)
            } else {
                // 没有查询到订单，用户只是发送了无关信息，主动向其展示披萨菜单
                return pizzaMenu()
            }
        })
}, {
    platform: ['twilio']
})
module.exports = api