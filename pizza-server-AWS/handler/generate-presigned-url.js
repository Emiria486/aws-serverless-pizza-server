/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-22 16:31:48
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @LastEditTime: 2023-07-22 16:57:39
 * @FilePath: \pizza-server-AWS\handler\generate-presigned-url.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const uuid = require("uuid")
const AWS = require("aws-sdk")
const s3 = new AWS.S3()


/**
 * Description 生成允许没有访问权限的用户上传文件的预签名url的函数
 * @returns {Promise} 带有签名url的json对象
 */
function generatePresignedUrl() {
    const params={
        Bucket:process.env.bucketName,  //从环境变量中取出存储桶的名称
        key:uuid(), //创建唯一的id
        ACL:'public-read',  //将对象设置未可供公共阅读
        Expires:120 //设置url到期时间（以秒为单位）
    }
    return new Promise((resolve,reject)=>{  //返回putObject方法的签名url
        s3.getSignedUrl('putObject',params,(err,url)=>{
            if(err)
                return reject(err)
            resolve({
                url:url
            })
        })
    })
}
module.exports=generatePresignedUrl()