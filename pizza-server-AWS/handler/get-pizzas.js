/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-19 22:43:51
 * @LastEditTime: 2023-07-28 12:30:38
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @FilePath: \pizza-server-AWS\handler\get-pizzas.js
 * @Description: 披萨信息展示函数
 */
const listOfPizzas = require("../data/pizzas.json")
/**
 * Description 从披萨列表中返回选中的披萨信息
 * @param {any} pizzaId 选中的披萨id
 * @param {any} pizzas=listOfPizzas 披萨列表,默认值为固定订单披萨数组,这里是为了测试在pizzas.json文件被更改时依然有效
 * @returns {any} 当选中成功时返回选中的披萨信息,没有披萨id返回披萨列表
 */
function getPizzas(pizzaId, pizzas = listOfPizzas) {
    //if(!pizzaId)  放弃使用这种判空方式因为可能会传递数字0,导致直接进入报错阶段
    if (typeof pizzaId === 'undefined' || pizzaId === null) {
        return pizzas
    }


    const pizza = pizzas.find((pizza) => {
        return pizza.id == pizzaId
    })

    if (pizza)
        return pizza

    throw `The pizza you requested was not found`
}

module.exports = getPizzas