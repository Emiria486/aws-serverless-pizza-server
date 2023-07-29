const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()
const pizzas = require('../data/pizzas.json')
const pizzaMenu = require('./pizza-menu')
const uuid = require('uuid')

/**
 * Description 向数据库中创建披萨订单
 * @param {any} pizzaId 披萨id
 * @param {any} sender  订单发起人
 * @returns {any} bot回复消息
 */
function orderPizza(pizzaId, sender) {
    const pizza = pizzas.find(pizza => pizza.id == pizzaId)

    return docClient.put({
            TableName: 'pizza-orders',
            Item: {
                orderId: uuid(),
                pizza: pizzaId,
                orderStatus: 'in-progress',
                platform: 'fb-messenger-chatbot',
                user: sender
            }
        }).promise()
        .then((res) => {
            return 'Where do you want your pizza to be delivered?'
        })
        .catch((err) => {
            console.log(err)

            return [
                'Oh! Something went wrong. Can you please try again?',
                pizzaMenu()
            ]
        })
}
module.exports = orderPizza