/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-26 16:38:01
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @LastEditTime: 2023-07-26 16:56:43
 * @FilePath: \sms-chatbot\handlers\pizza-menu.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const pizzas = require('../data/pizzas.json')

/**
 * Description 返回披萨菜单字符串
 * @returns {any} 所有披萨菜单的字符串
 */
function pizzaMenu() {
    let greeting = `Hello from Aunt Maria's pizzeria!
    Would you like to order a pizza?
    This is our menu:`
    pizzas.forEach(pizza => {
        greeting += `\n - ${pizza.name} to order reply with ${pizza.shortCode}`
    })
    return greeting
}
module.exports = pizzaMenu