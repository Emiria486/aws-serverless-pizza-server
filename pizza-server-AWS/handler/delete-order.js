/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-17 21:19:58
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @LastEditTime: 2023-07-19 20:02:26
 * @FilePath: \pizza-server-AWS\handler\delete-order.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const AWS=require("aws-sdk")
const docClient=new AWS.DynamoDB.DocumentClient()
const rp=require("minimal-request-promise")
function deleteOrder(id,userDate){
    return docClient.get({
        TableName:"pizza-orders",
        Key:{
            orderId:id
        },
    }
    )
    .promise()
    .then(res=>res.Item)
    .then(item=>{
        if(item.cognitoUsername!==userDate['cognito:username']){
            //如果订单不属于授权用户，这抛出错误
            throw new Error('Order is not owned by your user')
        }
        if(item.orderStatus!=='pending'){
            throw new Error('Order status is not pending')
        }
        return rp.delete(`https://fake-delivery-api.effortlessserverless.com/delivery/${id}`,{
            headers:{
                Authorization: 'aunt-marias-pizzeria-1234567890',
                'Content-type': 'application/json'
            }
        })
    })
    .then(()=>{
        return docClient.delete({
            TableName: 'pizza-orders',
            Key: {
              orderId: id
            }
        }).promise()
    })
}
module.exports=deleteOrder