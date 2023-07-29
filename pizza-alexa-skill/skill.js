/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-27 10:23:45
 * @LastEditTime: 2023-07-27 19:56:54
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @FilePath: \pizza-alexa-skill\skill.js
 * @Description: 头部注释配置模板
 */
const AlexaMessageBuilder = require('alexa-message-builder')
const pizzas = require('./data/pizzas.json')

/**
 * Description 为alexa skill 提供的lambda处理函数
 * @param {any} event alexa预处理的语音事件
 * @param {any} context
 * @param {any} callback    
 * @returns {any} 语音回复消息
 */
function alexaSkill(event, context, callback) {
    const TypeRequest = ['LaunchRequest', 'IntentRequest', 'SessionEndedRequest']
    if (!event || !event.request || TypeRequest.indexOf(event.request.type) < 0) {
        // 检查消息是否为Alexa事件，否则返回错误
        return callback('not valid Alexa request')
    }
    const message = new AlexaMessageBuilder() //创建Builder实例
    const pizzaNames = pizzas.map(pizza => pizza.name)
    console.log(pizzaNames)
    if (event.request.type === "LaunchRequest" || event.request.type === "IntentRequest" //检查消息是否为结束前语句
        &&
        //  检查消息是否为ListPizza意图
        event.request.intent.name === 'ListPizzas') {
        //返回披萨列表
        message.addText(`You can order: ${pizzaNames.toString()}. Which one do you want?`)
            // 并保持会话打开
            .keepSession()
    } else if (event.request.type === 'IntentRequest' && event.request.intent.name === "orderPizza" &&
        pizzaNames.indexOf(event.request.intent.slots.Pizza.value) > -1) {
        const pizza = event.request.intent.slots.Pizza.value
        message.addText(`What's the address where your ${pizza} should be delivered?`)
            .addSessionAttribute('pizza', pizza) //将披萨信息保存到session中以便下一步保存订单取用
            .keepSession() //保持会话不关闭以便下一步处理地址信息
    } else if (
        event.request.type === 'IntentRequest' &&
        event.request.intent.name === 'DeliveryAddress' &&
        event.request.intent.slots.Address.value //用户提供的地址不为空
    ) {
        // save pizza order 这里应该调用保持披萨订单函数
        // 告诉用户订单已经收到
        message.addText(`Thanks for ordering pizza. Your order is processed and pizza should be delivered shortly`)
    } else {
        // 告诉用户有错误，提示重新尝试
        message.addText('Oops, it seems there was a problem, please try again')
    }
    callback(null, message.get()) //从AWS lambda函数返回消息
}
exports.handler = alexaSkill