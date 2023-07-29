/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-25 16:56:50
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @LastEditTime: 2023-07-25 17:07:05
 * @FilePath: \pizza-fb-chatbot\handler\pizza-menu.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const pizzas = require('../data/pizzas.json')
const fbTemplate = require('claudia-bot-builder').fbTemplate

function pizzaMenu() {
    const message = new fbTemplate.Generic()
    pizzas.forEach(pizza => {
        message.addBubble(pizza.name)
            .addButton('Details', `DETAILS|${pizza.id}`)    //聊天机器人可以将值保存在Action|Id格式中，其中action表示大写的操作名称，id表示披萨ID
            .addButton('Order', `ORDER|${pizza.id}`)
    })
    return message.get()
}
module.exports = pizzaMenu