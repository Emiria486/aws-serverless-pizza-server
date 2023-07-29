/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-19 22:43:51
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @LastEditTime: 2023-07-20 21:00:33
 * @FilePath: \pizza-server-AWS\handler\update-order.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const AWSRay=require("aws-xray-sdk-core")
const AWS=AWSRay.captureAWS(require("aws-sdk")) //在AWSRay.captureAWS命令中封装aws-sdk模块
const docClient=new AWS.DynamoDB.DocumentClient()

function updateOrder(id,updates){
    if(!id||!updates){
        throw new Error('Order ID and updates object are required for updating the order')
    }
    return docClient.update({
        TableName:"pizza-orders",   //修改所在的表
        Key:{           //要修改订单的key
            orderId:id
        },
        UpdateExpression:"set pizza=:p,address=:a", //描述更新如何修改订单的属性
        ExpressionAttributeValues:{ //为updateExpression表达式提供值
            ':p':updates.pizza,
            ':a':updates.address
        },
        ReturnValues:"ALL_NEW"  //告诉dynamoDB我们希望返回一个全新的订单
    })
    .promise()
    .then(result=>{
        console.log('Order is updated!', result)
        return result.Attributes    //返回所有属性
    })
    .catch(updateError=>{
        console.log(`Oops, order is not updated :(`, updateError)
        throw updateError
    })
}
module.exports=updateOrder