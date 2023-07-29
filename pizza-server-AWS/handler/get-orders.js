const AWS=require("aws-sdk")
const docClient=new AWS.DynamoDB.DocumentClient()

function getOrders(orderId){
    if(typeof orderId==='undefined'){
        return docClient.scan({
            TableName:"pizza-orders"
        })
        .promise()
        .then(result=>result.Items)//返回所有条目
    }
    return docClient.get({
        TableName:"pizza-orders",
        Key:{
            orderId:orderId
        }
    }).promise()
      .then(result=>result.Item) //返回一个条目
}
module.exports=getOrders