const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()
const pizzaMenu = require('./pizza-menu')
const pizzas = require('../data/pizzas.json')

/**
 * Description 获取用户最后一次购买的披萨
 * @param {any} sender  用户信息
 * @returns {any}   披萨信息
 */
function getLastPizza(sender) {
    return docClient.scan({
            TableName: 'pizza-orders',
            ScanIndexForward: false, //
            Limit: 1,
            FilterExpression: "sender=:s",
            ExpressionAttributeValues: {
                ':s': sender
            }
        })
        .promise()
        .then(lastPizzOrder => {
            let lastPizza
            if (lastPizzOrder) {
                lastPizza = pizzas.find(pizza => pizza.id == lastPizzOrder.pizzaId)
            }
            return lastPizza
        })
        .catch(err => {
            console.log(err)
            return [
                'Oh! Something went wrong. Can you please try again?',
                pizzaMenu()
            ]
        })
}
module.exports = getLastPizza