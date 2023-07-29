/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-22 17:34:18
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @LastEditTime: 2023-07-22 21:16:45
 * @FilePath: \pizza-image-processor\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * Description 图片处理初始文件，从Lambda事件中提取数据
 * @param {any} event 由lambda函数触发的事件
 * @param {any} context lambda函数的上下文
 * @param {any} callback    允许从lambda函数回复的回调
 * @returns {any}
 */
const convert = require("./convert")

function handlerFunction(event, context, callback) {
    //将事件记录提取到单独的变量中
    const eventRecord = event.Records && event.Records[0]   
    if (eventRecord) {  //检查是否存在事件记录
        if (eventRecord.eventSource === 'aws:s3' && eventRecord.s3) {   //检查事件源是否来自S3，并转换新文件
            return convert(eventRecord.s3.bucket.name, eventRecord.s3.object.key)
                .then(response => { //假如转换成功，就通过回调返回成功响应
                    callback(null, response)
                })
                .catch(callback)//  否则，返回错误
        }
        return callback('unsupported event source') //事件不来自S3，返回错误
    }
    callback('no records in the event') //事件不存在，返回错误
}
exports.handler = handlerFunction