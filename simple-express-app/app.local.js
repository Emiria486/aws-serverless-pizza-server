/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-29 20:46:54
 * @LastEditTime: 2023-07-29 21:45:40
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @FilePath: \simple-express-app\app.local.js
 * @Description: 本地运行封装好的express应用
 */
const app = require("./app")
const port = process.env.port || 3000

app.listen(port, () => console.log(`App listening on port ${port}`))