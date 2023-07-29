/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-25 16:56:38
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @LastEditTime: 2023-07-25 17:57:43
 * @FilePath: \pizza-fb-chatbot\handler\pizz-details.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const pizzas = require('../data/pizzas.json')
const fbTemplate = require('claudia-bot-builder').fbTemplate

/**
 * Description 展示披萨配料详情
 * @param {any} id  披萨id
 * @returns {any}   bot回复语句
 */
function pizzaDetails(id) {
    const pizza = pizzas.find(pizza => pizza.id == id)
    return [
        `${pizza.name} has following ingredients:` + pizza.ingredients.join(','),
        new fbTemplate.Button('What else can I do for you?')
        .addButton('order', `ORDER|${pizza.id}`)
        .addButton('Show all pizzas', 'ALL_PIZZAS')
        .get()
    ]
}
module.exports = pizzaDetails