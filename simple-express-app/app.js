/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-29 20:46:48
 * @LastEditTime: 2023-07-29 21:39:54
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @FilePath: \simple-express-app\app.js
 * @Description: express应用，为适合AWS lambda进行了修改
 */
const express = require('express')
const app = express()
const {
    MongoClient
} = require('mongodb')
const bodyParser = require('body-parser') //允许express应用解析post请求
global.cachedDb = null //设置全局变量cachedDb

/**
 * Description 连接mongodb数据库连接,并设置为全局变量
 * @param {any} uri 数据库url
 * @returns {any} 数据库连接promise
 */
function connectToDatabase(uri) {
    if (global.cachedDb && global.cachedDb.serverConfig.isConnected()) {
        console.log('=> using cached database instance')
        return Promise.resolve(cachedDb)
    }
    return MongoClient.connect(uri)
        .then(client => {
            cachedDb = client.db(taxi)
            console.log('not cached')
            return cachedDb
        })
}
app.use(bodyParser.json()) //使用中间件解析json
app.use('/static', express.static("static")) //使用static中间件，从static文件夹提供静态内容

app.get('/claudia', (req, res) => {
    res.sendFile(`${__dirname}/static/claudiajs.png`)   //发送静态图片
})
app.get('/', (req, res) => res.send('Hello world'))

app.get('/orders', (req, res) => {
    connectToDatabase(process.env.MONGODB_CONNECTION_STRING)
        .then(db => {
            console.log(db)
            return db.collection('orders').find().toArray()
        })
        .then(result => {
            console.log('result', result)
            return res.send(result)
        })
        .catch(err => res.send(err).status(400))
})
app.post('/orders', (req, res) => {
    connectToDatabase(process.env.MONGODB_CONNECTION_STRING)
        .then(db => {
            return db.collection('orders').insertOne({
                address: req.body.address
            })
        })
        .then(result => res.send(result))
})
app.delete("/orders/:id", (req, res) => {
    connectToDatabase(process.env.MONGODB_CONNECTION_STRING)
        .then(db => {
            return db.collection('orders').deleteOne({
                _id: new mongodb.ObjectID(req.params.id)
            })
        })
        .then(result => res.send(result))
        .catch(err => res.send(err).status(400))
})
module.exports = app