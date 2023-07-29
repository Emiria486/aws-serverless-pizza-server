/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-29 18:36:05
 * @LastEditTime: 2023-07-29 19:05:01
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @FilePath: \serverless-payment\repositories\payment-repository.js
 * @Description: 负责与stripe通信，管理与stripe相关的事务
 */
// 用STRIPE_SECRET_KEY实例化stripe sdk
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
module.exports = {
    createCharge: (stripeToken, amount, currency, description) => {
        return stripe.charges.create({
            source: stripeToken,
            amount: amount,
            currency: currency,
            description: description
        })
    },
    getAllCharges: () => {
        return stripe.charges.list()
            .then(response => response.data)
    }
}