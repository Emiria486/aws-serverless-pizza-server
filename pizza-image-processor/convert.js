/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-22 17:34:25
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @LastEditTime: 2023-07-23 09:38:05
 * @FilePath: \pizza-image-processor\convert.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const fs = require("fs")
const path = require('path')
const exec = require('child_process').exec //用于调用外部的ImageMagick命令
const mime = require('mime') //获取图片MIME类型并设置为缩略图的内容类型
const aws = require('aws-sdk')
const s3 = new aws.S3()

/**
 * Description 文件转换函数
 * @param {any} bucket  S3存储桶名称
 * @param {any} filePath    S3文件路径
 * @returns {any} s3文件Promise
 */
function convert(bucket, filePath) {
    const fileName = path.basename(filePath)
    return s3.getObject({
            Bucket: bucket,
            Key: filePath
        })
        .promise()
        .then(response => {
            return new Promise((resolve, reject) => {
                if (!fs.existsSync('/tmp/images')) {
                    fs.mkdirSync('/tmp/images') //在/tmp中创建images和thumbnials文件夹
                }
                if (!fs.existsSync('/tmp/thumbnails/')) {
                    fs.mkdirSync('/tmp/thumbnails/')
                }
                // 将S3文件保存到本地路径
                const localFilePath = path.join('/tmp/images', fileName)
                fs.writeFile(localFilePath, response.Body, (err, fileName) => {
                    if (err) {
                        return reject()
                    }
                    resolve(filePath)
                })
            })
        })
        .then(filePath => {
            return new Promise((resolve, reject) => {
                const localFilePath = path.join('/tmp/images/', fileName)
                // 使用ImageMagick调整图片大小
                exec(`convert${localFilePath} -resize 1024X1024\\> ${localFilePath}`, (err, stdout, stderr) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve(fileName)
                })
            })
        })
        .then(filePath => {
            return new Promise((resolve, reject) => {
                const localFilePath = path.join('/tmp/images/', fileName)
                const localThumbnailPath = path.join('/tmp/thumbnails/', fileName)
                exec(`convert ${localFilePath} -resize 120x120\\> ${localThumbnailPath}`, (err, stdout, stderr) => {
                    if (err)
                        return reject(err)
                    resolve(fileName)
                })
            })
        })
        .then(filePath => {
            return new Promise((resolve, reject) => {
                const localImageFilePath = path.join('/tmp/images/', fileName)
                const localThumbnailPath = path.join('/tmp/thumbnails/', fileName)
                return Promise.all([
                    s3.putObject({
                        Bucket: bucket,
                        Key: `thumbnails/${fileName}`,
                        Body: fs.readFileSync(localThumbnailPath),
                        ContentType: mime.getType(localThumbnailPath),//获取文件的mime类型
                        ACL: "public-read"
                    })
                    .promise(),
                    s3.putObject({
                        Bucket: bucket,
                        Key: `images\${filename}`,
                        Body: fs.readFileSync(localImageFilePath),
                        ContentType: mime.getType(localImageFilePath),
                        ACL: 'public-read'
                    }).promise()
                ])
            })
        })
}
module.exports = convert