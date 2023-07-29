# 🎂使用ClaudiaJS部署到Lambda函数和API Gateway

## 1.在package.json配置npm命令行

```js
claudia create //创建并部署新的lambda函数，
--region eu-central-1 //选择要部署函数的区域，
--api-module api //告诉claudia正在构建api，并且API的入口点是api.js(自动附加.js扩展名)


--以上文字是同一行命令
```

```js
//假如入口文件在src文件夹下的index.js,那么应该是
--api-module src/index
```

## 2.运行npm 命令行

```shell
npm run create 或claudia create(前提是全局安装Claudia)
```

由Claudia生成claduia.json文件并返回响应信息如下

```json
{
    //lambda函数信息
	"lambda":{
        "role":"pizza-api-executor",
        "name":"pizza-api",
        "region":"eu-central-1"
    }
    //api信息
    "api":{
    "id":"ads99d9adf",
    "module":"api",
    "url":"https://wwwafsads.execute-api.eu-central-1.amazonaws.com/latest"    //APi的基本url
	}
}
```

通过这个链接：https://wwwafsads.execute-api.eu-central-1.amazonaws.com/latest/pizzas就可以访问我们刚才创建的🥧信息

同时在项目根目录下生成Claudia.json文件

## 3.部署更新后的api

```js
claudia update	//更新api函数
```

# 🐱‍🐉使用aws dynamodb 存储数据

## 1.使用aws cli创建dynamoDB表

dynamoDB是nosql数据库

```js
aws dynamodb create-table  
--table-name pizza-orders  //创建表名
--attribute-definitions AttributeName=orderId,AttributeTypes=S 		//提供属性定义并告诉数据库键是String(S)类型
--key-schema AttributeName=orderId,keyType=HASH //提供键模式
--provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 	//设置表的读写容量为1，开发版本不需要太高
--region eu-central-1		//选择表的区域
--query TableDesription.TableArn  --output text			//query:打印表的Amazon资源名称以确认所有内容都已正确设置 output:定义输出的类型
```

## 2.连接使用dynamoDB库

```js
1.安装aws-sdk npm模块
2.使用aws-sdk模块中的DocumentClient类进行异步通信
```

## 3.在代码中使用dynamodb库

```js
'use strict'
//导入aws-sdk 并初始化DocumentClient类
const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()
const uuid = require('uuid')

function saveOrder(request) {
  if (!request || !request.pizza || !request.address)
    throw new Error('To order pizza please provide pizza type and address where pizza should be delivered')

  return docClient.put({
    TableName: 'pizza-orders',
    Item: {
      orderId: uuid(),
      pizza: request.pizza,
      address: request.address,
      status: 'pending'
    }
  })
  //调用返回promise的.promise（）方法
  .promise()
  //如果请求已接收，就记录响应并返回数据
  .then((res)=>{
    console.log("order is saved",res)
  })
//   如果请求被拒绝，抛出错误
  .catch((saveError)=>{
    console.log(`Oops, order is not saved :(`, saveError)
    throw saveError
  })
}

module.exports = saveOrder

```

## 4.为lambda函数添加数据库权限

为lamdba函数能与数据库进行通信，需要在项目中为其创建角色文件

```js
//代表dynamodb角色的json文件
{
  "Version": "2012-10-17",
  "Statement": [  
    {
      "Action": [			//定义这个角色允许或拒绝的特定操作
        "dynamodb:Scan",
        "dynamodb:DeleteItem",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem"
      ],
      "Effect": "Allow",		//启用定义的操作
      "Resource": "*"			//将角色应用于所有的dynamo表
    }
  ]
}

```

使用AWS cli的iam部分的put-role-policy命令添加策略，并放到package.json中作为script运行

```js
"scripts": {
    "putRolePolicy"：aws iam put-role-policy
	--role-name pizza-api-executor 									// 将策略附加到从claudia.json文件获得的lambda角色
	--policy-name PizzaApitDynamoDB									//命名策略
    --policy-document file://./roles/dynamodb.json  				//使用dynamodb.json文件作为创建策略的源
}

```

使用scan命令列出表中所有的条目，并放到package.json中作为script运行

```js
"scripts": {
    "scan":aws dynamodb scan 		//使用scan命令列出表中所有的条目
    	--table-name pizza-orders	//scan 命令需要以表名作为参数
    	--region	eu-central-1	
    	--output	json	//指定响应的格式
}
```

## 5.在代码中对数据库数据进行增删改查操作

### 增

```js
const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()
const uuid = require('uuid')

function saveOrder(request) {
  if (!request || !request.pizza || !request.address)
    throw new Error('To order pizza please provide pizza type and address where pizza should be delivered')

  return docClient.put({
    TableName: 'pizza-orders',
    Item: {
      orderId: uuid(),
      pizza: request.pizza,
      address: request.address,
      status: 'pending'
    }
  })
  //调用返回promise的.promise（）方法
  .promise()
  //如果请求已接收，就记录响应并返回数据
  .then((res)=>{
    console.log("order is saved",res)
    return res
  })
//   如果请求被拒绝，抛出错误
  .catch((saveError)=>{
    console.log(`Oops, order is not saved :(`, saveError)
    throw saveError
  })
}
```

### 删

```js
const AWS=require("aws-sdk")
const docClient=new AWS.DynamoDB.DocumentClient()
function deleteOrder(id){
    if(!id){
        throw new Error('Order ID is required for deleting the order')
    }
    return docClient.delete({
        TableName:"pizza-orders",
        Key:{
            orderId:id
        }
    })
    .promise()
    .then(result=>{
        console.log('Order is deleted!', result)
        return result
    })
    .catch(deleteError=>{
        console.log(`Oops, order is not deleted :(`, deleteError)
        throw deleteError
    })
}
```



### 改

```js
const AWS=require("aws-sdk")
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
```



### 查

```js
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
```

# 🐱‍🚀连接外部API

## 1.连接外部APi完成外包送货服务

```js
const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()
const rp=require("minimal-request-promise")

function saveOrder(request) {
  if (!request || !request.pizza || !request.address)
    throw new Error('To order pizza please provide pizza type and address where pizza should be delivered')

  return rp.post("https://fake-delivery-api.effortlessserverless.com/delivery",{
    headers:{
      Authorization:'aunt-marias-pizzeria-1234567890',
      "Content-type":"application/json"
    },
    body:JSON.stringify({
      pickupTime:'15.34pm',
      pickupAddress: 'Aunt Maria Pizzeria',
      deliveryAddress: request.address,
      webhookUrl: 'https://g8fhlgccof.execute-api.eu-central-1.amazonaws.com/latest/delivery',  //用于发送传递状态更新
    })
  })
  //先向外部api发送请求后再进行本地api处理
  .then(rawResponse=>{
    JSON.parse(rawResponse)
  })
  .then(response=>{
    return docClient.put({
      TableName:"pizza-orders",
      Item:{
        orderId: response.deliveryId,
        pizza: request.pizza,
        address: request.address,
        orderStatus: 'pending'
      }
    })
    .promise()
  })
  .then(res=>{
    console.log('Order is saved!', res)

      return res
  })
  .catch(saveError=>{
    console.log(`Oops, order is not saved :(`, saveError)
    throw saveError
  })
}

```

## 2.使用外部的webhook完成订单送货状态更新

```js
const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()

function updateDeliveryStatus(request){
    if (!request.deliveryId || !request.status)
    throw new Error('Status and delivery ID are required')

    return docClient.update({
        TableName:'pizza-orders',
        Key:{
            orderId:request.deliveryId
        },
        UpdateExpression:"set deliveryStatus=:s",
        ExpressionAttributeValues:{
            ':s':request.status
        }
    })
    .promise()
    .then(()=>{
        return {}
    })
}
```

## 3.总结

使用AWS lambda 只要异步操作正确，就可以像其他NodeJS应用一样连接到任何外部服务

要连接到外部API，要确保HTTP库支持promise

## 额外注意

lambda函数默认超时时间为3秒，可以在在函数创建期间设置超时

```js
claudia create --region eu-central-1 --api-module api --timeout 10
```

```js
//更新函数超时时间
claudia update --timeout 10
```

# 🐱‍👤使用CloundWatch调试程序

## 1.使用CloudWatch读取控制台日志

CloudWatch可以自动捕获函数的日志和错误，如console.log

这里使用AWS cli的方法获得日志

### 1.1找到日志组的名称

```js
aws logs descripe-log-groups  --region eu-central-1

//上面的命令将返回包括logGroupName的响应
{
    "logGroups":[
        "logGroupName":"/aws/lambda/pizza-api",
        ....
    ]
}
```

### 1.2过滤找到指定日志

```js
aws logs filter-log-events //filter-log-event命令用来过滤日志事件
--filter='createOrder' //过滤字符串
--log-group-name=/aws/lambda/pizza-api	//仅显示/aws/lamdba/pizza-api日志组的筛选日志
--query='events[0].message'	//告诉AWS cli只需要最新事件的消息
--region=eu-centeral-1
--output=json	//将JSON设置为输出格式
```

## 2.使用AWS X-Ray可视化API调用

注意可视化适用于web 控制台，因无法从终端看到可视化表示

### 2.1.将AWS X-Ray托管的只读策略附加到lamdba角色

```js
aws iam	//使用AWS Cli中的iam服务
	attach-role-policy	//使用attach-role-policy命令附加策略
	--policy-arn arn:asw:iam::aws:policy/AWSXrayWriteOnlyAccess //为附加的策略提供arn
	--role-name pizza-api-executor	//选择要将策略附加到的任务
	--region eu-central-1
	--output json
```

### 2.2更新函数配置，使用主动跟踪

```js
aws lambda //使用AWS Cli中的lambda服务,更新函数
	update-function-configuration //更新函数配置
	--function-name pizza-api	//通过提供名称来选择函数
	--tracing-config Mode=Activie	//将跟踪模式设置为Active
	--region eu-central-1
```

### 2.3让AWS-Ray可以看到其他AWS服务

上面命令可以显示Lamdba函数流但是默认情况下无法看到函数正在使用的其他AWS服务，例如数据库服务。

为了看到AWS-X-Ray支持的其他服务，需要将针对Node.js的AWS SDK封装在aws-xray模块中

```js
const AWSRay=require("aws-xray-sdk-core")
const AWS=AWSRay.captureAWS(require("aws-sdk")) //在AWSRay.captureAWS命令中封装aws-sdk模块
//其他部分不变
```

然后执行claudia update 命令，重新部署api后，完成设置

# 🐱‍🏍AWS Cognito-用户身份验证和授权

## 1.概念介绍

AWS Cognito有两个主要的身份概念：用户池和身份池

用户池：提供身份管理的服务，还具有开箱即用授权的可能性，可以使用AWS Cognito SDK实施用户池授权机制

身份池：负责处理身份验证提供程序并为AWS资源提供临时授权的服务，

- 能与社交身份提供商（Facebook，google和openId）以及AWS Cognito 用户池的身份验证身份提供商集成
- 为经过身份验证的用户临时访问应用的AWS资源

AWS Cognito可以在请求到达应用之前进行授权，可通过API Gateway级别设置授权来实现，如果用户未获得授权，可在请求到达Lamda函数和DB表之前停止请求

Facebook身份认证流程：

![微信图片_20230720215717](C:\Users\刘永杰\Desktop\微信图片_20230720215717.jpg)

## 2.创建用户池和身份池

可以在package.json中创建script来创建命令

```js
"scripts":{
    "createPoolClient": aws cognito-idp create-user-pool	//创建用户池
    			      --pool-name Pizzaia  //设置用户池的名称
                       --policies 'PasswordPolicy={MinimumLength=8,RequireUppercase=false,RequireLowercase=false，RequireNumber=false,RequireSymbols=false}'	//自定义密码策略
    			     --username-attibutes email //将电子邮件地址定义为唯一的用户池ID
                     --query UserPool.id	//将用户池ID作为文本打印
    				--output text
}
```

用户池至少需要一个客户端，以便用来连接

```js
"scripts":{
    "createPoolClient":aws cognito-idp create-user-pool-client
    				--eu-central-1_userPoolId	//这里的userPoolId指定从上一个命令收到的用户池ID
                    --client-name PizzeriaClinet	//指定客户名称
                    --no-generate-secret			//不要生成客户端密钥
    				--query UserPoolClient.ClientId //将客户端ID打印为文本
                    --output text
}
```

创建标识池

```js
"scripts":{
    "createIdentityPool": aws cognito-identity create-identity-pool	//创建标识池
    				--identity-pool-name Pizzeria	//设置标识池的名称
                    --allow-unauthenticated-indentities  //允许未经身份验证的用户使用标识池登录
    				--supported-login-providers graph.facebook.com=266094173886660	//添加支持的登录提供程序
    				--cognito-indentity-providers Providername=cognito-idp.eu-central-1.amazonaws.com/eu-central-1_qpPMn1Tip,ClientId=4q14u0qalmkangdkhieekqbjma,ServerSideTokenCheck=false	//使用前面收到的用户池Id和客户端Id添加Cognito身份提供程序
    				--query IdentityPoolId --output text	//将标识池ID打印为文本
}
```

成功创建标识池后，需要创建两个角色并将它们分配给经过身份验证和未经身份验证的用户

创建角色可以在AWS Web控制台进行角色的创建和分配，转到标识池，单击edit identity pool 按钮然后单击用于”经过身份验证的角色“和”未经身份验证的角色“的create New Role链接

```js
//aws cli向身份池添加角色
aws cognito-identity set-identity-pool-roles	//设置标识池的角色
	--identity-pool-id eu-central-1:<标识池Id> 	//提供标识池Id
    --roles authenticated=<上面创建的经过身份验证的角色的ARN>,unauthenticated=<上面创建的未经过身份验证的角色的ARN>	//为两种用户创建角色
```

## 3.在node.js中使用cognito

先设置userPoolARN

```js
//env.json
{
    "userPoolArn":"Add your User pool ARN here"
}
```

然后路由路径文件(api.js)中注册使用

```js
const APi = require("claudia-api-builder")
const api = new APi()
//注册自定义授权器
api.registerAuthorizer("userAuthentication", {
    providerARNs: [process.env.userPoolArn] //从环境变量中获取用户池ARNb并设置为提供者ARN
})
api.post("/orders", (request) => {
    return createOrder(request)
}, {
    success: 201,
    error: 404,
    cognitoAuthorizer: "userAuthentication" //在特定路径上启用授权
})
```

在函数文件中使用

```js
function saveOrder(request) {
  const userDate=request.context.authorizer.claims //从上下文对象中获取授权顺序添加的用户数据，然后进行记录
  let userAddress=request.body&&request.body.address //默认情况下，使用请求正文中的地址
  if(!userAddress){
    //如果未提供地址，使用用户的默认地址
    userAddress=JSON.parse(userDate.address)
  }
  if (!request || !request.body.pizza || !userAddress)
    throw new Error('To order pizza please provide pizza type and address where pizza should be delivered')

  return rp.post("https://fake-delivery-api.effortlessserverless.com/delivery",{
    headers:{
      Authorization:'aunt-marias-pizzeria-1234567890',
      "Content-type":"application/json"
    },
    body:JSON.stringify({
      pickupTime:'15.34pm',
      pickupAddress: 'Aunt Maria Pizzeria',
      deliveryAddress: userAddress,
      webhookUrl: 'https://g8fhlgccof.execute-api.eu-central-1.amazonaws.com/latest/delivery',  //用于发送传递状态更新
    })
  })
  //先向外部api发送请求后再进行本地api处理
  .then(rawResponse=>{
    JSON.parse(rawResponse)
  })
  .then(response=>{
    return docClient.put({
      TableName:"pizza-orders",
      Item:{
        cognitoUsername:userAddress['cognito:username'],//将用户名从Cognito保存到数据库中
        orderId: response.deliveryId,
        pizza: request.body.pizza,
        address: userAddress,
        orderStatus: 'pending'
      }
    })
    .promise()
  })
  .then(res=>{
    console.log('Order is saved!', res)

      return res
  })
  .catch(saveError=>{
    console.log(`Oops, order is not saved :(`, saveError)
    throw saveError
  })
}
```

```js
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
```

# ✨AWS处理文件

## 1.使用S3创建存储桶

在cli 中执行

```shell
"scripts": {
    "createBucket":aws s3 mb s3://aunt-marias-pizzeria --region eu-central-1 
    //将S3存储桶命名为aunt-marias-pizzeria并指定区域
}
```

## 2.在nodeJS中生成允许访问存储桶的url

```js
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
```

添加到api路由中

```js
api.get('upload-url', (request) => {
  return getSignedUrl()
},
{
  error: 400
},
{
  cognitoAuthorizer: 'userAuthentication'
})

```

## 3.微服务方式--生成缩略图

![](C:\Users\刘永杰\Desktop\微服务.jpg)

创建一个接收事件，lambda上下文和回调的处理函数

```js
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
```

创建真正进行缩略图转化的函数以供上面的处理函数调用

```js
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
```

## 4.部署到AWS

部署图片处理服务

```js
 "scripts": {
     "create": "claudia create --region eu-central-1 --handler index.handler",
         //对于没有API的函数，使用的不是--api-module标志，而是-hanlder标志
         //--handler标志期望处理程序的路径带有.handler后缀，例如在index.js文件中使用处理程序导出，那么路径将是index.handler
         //需要主文件以导出handler属性，因此，--handler标志仅适用于exports.handler
 }
```

将S3触发器添加到Lambda函数

```js
 "scripts": {
     "setTrigger":claudia add-s3-event-source	//将S3事件源添加到函数
    		--bucket aunt-marias-pizzaria	//指定存储桶
     		--prefix images		//指定前缀：将触发事件的S3文件夹
 }
```

```js
"scripts": {
	"update": "claudia update --no-optional-dependencies"    
    //默认情况下AWS-SDK在AWS Lambda上可用，为了加快部署，应该将其重新安装为可选依赖项
    //并使用--no-optional-dependencies标志运行claudia update命令，这样可以从部署到lambda函数的zip文件中删除可选的依赖项
}

```

# 🥩构建无服务器聊天机器人

## 1.聊天机器人的工作流程

![](C:\Users\刘永杰\Desktop\聊天机器人.jpg)

## 2.创建bot的代码工作

```js
const pizzas = require('./data/pizzas.json')
const botBuilder = require('claudia-bot-builder')
const fbTemplate = botBuilder.fbTemplate //创建新的fbTemplate常量，用于公开Facebook模板消息构建器

const api = botBuilder(() => {
    const message = new fbTemplate.Generic() //创建模板类的实例
    pizzas.forEach(pizza => {
        // 循环披萨列表
        message.addBubble(pizza.name) //添加气泡
            .addImage(pizza.image) //添加图片
            .addButton("Details", pizza.id) //为每个披萨添加按钮，并且在用户单击按钮时将披萨id作为值传递
    })
    return [
        `Hello, here's our pizza menu:`,
        message.get() //将按钮转换为Facebook期望的json响应
    ], {
        platforms: ['facebook'] //提供一系列想要启用的平台，这里只选择Facebook
    }
})

module.exports = api
```



## 3.部署bot

```js
"scripts": {
    "createBoot":claudia create --region eu-central-1 
        					--api-module bot 	//设置api GateWay
        					--configure-fb-bot	//配置facebook messenger聊天机器人
    "update":claudia update 
        	--cache-api-config apiConfig	//跳过重建步骤并加快部署
}
```

在AWS部署后还需要在Facebook开发者平台中设置webhook和验证令牌并配置应用密钥，详情配置参考官网。

## 4.claudia bot Builder工作方式



![](C:\Users\刘永杰\Desktop\bot builder工作流程.jpg)

![](C:\Users\刘永杰\Desktop\bot builder函数.jpg)

# 🍕更强大的聊天bot

## 1.提供地址和webhook的bot

机器人流程

![](C:\Users\刘永杰\Desktop\bot-交付.jpg)

交付webhook流程

![](C:\Users\刘永杰\Desktop\交付webhook流程.jpg)

```js

/**
 * Description 创建处理函数，接收请求对象和访问令牌作为参数
 * @param {any} request 请求参数
 * @param {any} facebookAccessToken 访问令牌
 * @returns {any} facebook messenger 回复
 */
function deliveryWebhook(request, facebookAccessToken) {
    if (!request.deliveryId || !request.status) {
        throw new Error('Status and delivery ID are required')
    }
    return doClient.scan({
            TableName: 'pizza-orders',
            Limit: 1,
            FilterExpression: 'deliveryId=:d',
            ExpressionAttributeValues: {
                ':d': {
                    S: request.deliveryId
                }
            }
        })
        .promise()
        .then(result => result.Items[0])
        .then(order => {
            return doClient.update({
                TableName: 'pizza-orders',
                Key: {
                    orderId: order.orderId
                },
                UpdateExpression: "set orderStatus=:s",
                ExpressionAttributeValues: {
                    ':s': request.status
                },
                ReturnValues: "ALL_New"
            }).promise()
        })
        .then(order => {
            //reply通过提供用户ID，信息和facebook messengerToken来回复客户
            return reply(order.user, `The status of your delivery is updated to: ${order.status}.`, facebookAccessToken)
        })
}
module.exports = deliveryWebhook
```

在bot.js中进行对于动作的处理

```js
const botBuilder = require('claudia-bot-builder')

const pizzaDetails = require('./handlers/pizz-details')
const orderPizza = require('./handlers/order-pizza')
const pizzaMenu = require('./handlers/pizza-menu')
const saveLocation = require('./handlers/save-location')
const getLastPizza = require("./handlers/save-last-pizza")
const deliveryWebhook = require('./handlers/delivery-webhook')

const api = botBuilder(message => {
    if (message.postback) { //检查是否为回传信息
        const [action, pizzaId] = message.text.split('|') //如果是，拆分文本数字获得动作和披萨id
        if (action === 'DETAILS') {
            return pizzaDetails(pizzaId)
        } else if (action === 'ORDER') {
            return orderPizza(pizzaDetails, message.sender)
        }
    }
    // 检查客户是否共享了他们的位置
    if (message.originalRequest.message.attachments &&
        message.originalRequest.message.attachments.length &&
        message.originalRequest.message.attachments[0].payload.coordinates &&
        message.originalRequest.message.attachments[0].payload.coordinates.lat &&
        message.originalRequest.message.attachments[0].payload.coordinates.long) {
        // 使用发送者id和坐标调用保存坐标函数
        return saveLocation(message.sender, message.originalRequest.message.attachments[0].payload.coordinates)
    }
    // 检查是否存在nlp密钥以及实体，并在其中包含thanks实体
    if (message.originalRequest.message.nlp &&
        message.originalRequest.message.nlp.entities &&
        message.originalRequest.message.nlp.entities['thanks'] &&
        message.originalRequest.message.nlp.entities['thanks'].length &&
        // 在确信值大于0.8是启动
        message.originalRequest.message.nlp.entities['thanks'][0].confidence > 0.8) {
        return `You're welcome!`
    }
    // 搜索客户最后一个披萨数据
    return getLastPizza(message.sender).then(lastPizza => {
        let lastPizzaText = lastPizza ? `glad to have you back! Hope you liked your ${lastPizza.name} pizza` : ''
        return [
            `Hello, ${lastPizzaText} here's our pizza menu:`,
            pizzaMenu()
        ]
    })
}, {
    platforms: ['facebook']
})

//订单状态的更新
/* 
    claudia bot builder会调出claudia API builder的实例，所以api可以返回API builder的全功能实例
*/
api.post('/delivery', request => deliveryWebhook(request.body, request.env.request.env.facebookAccessToken), {
    success: 200,
    error: 400
})

module.exports = api
```

## 2.集成简单的NLP

```js
const api = botBuilder(message => { 
// 检查是否存在nlp密钥以及实体，并在其中包含thanks实体
    if (message.originalRequest.message.nlp &&
        message.originalRequest.message.nlp.entities &&
        message.originalRequest.message.nlp.entities['thanks'] &&
        message.originalRequest.message.nlp.entities['thanks'].length &&
        // 在确信值大于0.8是启动
        message.originalRequest.message.nlp.entities['thanks'][0].confidence > 0.8) {
        return `You're welcome!`
    }
}
    
module.exports = api
```

# 🍙利用Twilio构建短信sms聊天bot

## 1.设置twilio

我们要先创建该该服务的lambda函数，因为下面要使用

注册twilio账号->获取twilio号码->设置twilio可编程sms服务

1. 在注册账户阶段可以预先选择：要使用的产品：SMS，要构建的内容：SMS Support，要使用的语言：node.js
2. 获取twilio号码：在可编程SMS项目页面上单击get a number 按钮，然后单击choose this number.
3. 设置twilio可编程sms服务：选择messaging services导航栏，单击create new service，出现询问服务的名称和用例的窗口，将名字设置为aunt maria's pizzeria chatbot,将用例设置为Mixed。出现配置页面，在Request URL文本字段中输入lambda SMS 聊天机器人的url,点击save。然后在消息服务中添加请求的twilio号码（单击messaging services选项卡的Numbers链接，在Numbers页面中，单击add an existing number按钮，然后将号码选中添加，并把lambda SMS 聊天机器人的url黏贴到Request URL中）。
4. 完成设置

## 2.完成代码和部署升级

SMS-bot流程

![](C:\Users\刘永杰\Desktop\smsbot流程.jpg)

```js
//这是sms聊天机器人的入口文件
const botBuilder = require('claudia-bot-builder')
const pizzas = require('./data/pizzas.json')
const pizzaMenu = require('./handlers/pizza-menu')
const orderPizza = require('./handlers/order-pizz')
const checkOrderProgress = require('./handlers/check-order-progress')
const saveAddress = require('./handlers/save-address')

const api = botBuilder((message, originalApiRequest) => {
    // 定义用户选择的披萨
    let chosenPizza
    pizzas.forEach(pizza => {
        // 检查用户发来的消息是否有披萨的简称，如果确定选择披萨并赋值
        if (message.text.indexOf(pizza.shortCode) != -1) {
            chosenPizza = pizza
        }
    })
    // 如果有选中的披萨，为其订购披萨
    if (chosenPizza) {
        return orderPizza(chosenPizza, message.sender)
    }
    // 假如不是包含披萨名称的短信，调用检查订单准备状态的程序
    return checkOrderProgress(message.sender)
        .then(orderInProgress => {
            if (orderInProgress) {  //假如有订单那么说明这是用户发送的地址信息，调用保存地址函数
                return saveAddress(orderInProgress, message)
            } else {
                // 没有查询到订单，用户只是发送了无关信息，主动向其展示披萨菜单
                return pizzaMenu()
            }
        })
}, {
    platform: ['twilio']
})
module.exports = api
```

代码部署

```js
"scripts": {
"create": "claudia create  --region eu-central-1 --api-module sms-bot",//创建lambda函数服务
    "configure": "claudia update --configure-twilio",//将twilio配置为聊天机器人的平台
    "update": "claudia update --cache-api-config apiConfig --no-optional-dependencies"
}
```

# 🍨使用Alexa完成语音点单

## 1.Alexa工作原理

Alexa允许自定义skill，skill是Alexa可以学习的新命令，相当于应用程序

![](C:\Users\刘永杰\Desktop\Alexa工作原理图.jpg)

Alexa注意点

- Alexa有内置的nlp，并且只将解析后的请求以JSON格式传递给webhook
- Alexa对话是基于命令的，不允许自由对话，消息必须被识别为预定义的命令之一
- 语音助手通常想要唤醒词，用于指示

![](C:\Users\刘永杰\Desktop\Alexa调用图.jpg)

![](C:\Users\刘永杰\Desktop\alexa skill的调用和解析流程.jpg)

```
意图（intent） 		样本话语列表		自定义插槽（slot） 
OrderPizza		I would like to order	{pizza}
```

![](C:\Users\刘永杰\Desktop\skill流程.jpg)

```
								Alexa请求类型
LaunchRequest 						当使用start或者launch启动词触发skill时发送，没有收到自定义slot
IntentRequest						每当解析包含intent的用户消息时发送
SessionEndRequest					当用户会话结束时发送
AudioPlayer或Playback Controller		当用户使用任何音频播放器或播放功能时触发，如暂停音频或播放下一首歌曲
```



## 2.进行Alexa skill配置

要使用Alexa skill，想要先去Amazon 官网进行账户设置，并将intent,slot,sample-utterances添加到交互模型（interaction model）

下面是在项目中进行配置 

- 配置意图模式文件

```json
{
  "intents": [	//意图的数组
      {		//展示全部披萨消息的意图
        "intent": "ListPizzas"
      }, {	//订购披萨的意图
        "intent": "OrderPizza",
        "slots": [
            {
              "name": "Pizza",
              "type": "LIST_OF_PIZZAS"	//自定义插槽类型
            }
        ]
      }, {
        "intent": "DeliveryAddress",
        "slots": [
            {
              "name": "Address",
              "type": "AMAZON.PostalAddress"	//使用内置的插槽类型
            }
        ]
      }
  ]
}

```

- 准备好pizza-slot.txt，用来作为LIST_OF_PIZZAS使用

```txt
Capricciosa
Quattro Formaggi
Napoletana
Margherita
```

- 准备样本话语列表(使用txt)，每一个样本话语位于单独的行

```js
//每一行都应该以意图名称开头，然后是短语实例
ListPizzas Pizza menu
ListPizzas Which pizzas do you have
ListPizzas List all pizzas

OrderPizza {Pizza}
OrderPizza order {Pizza}
OrderPizza I want {Pizza}
OrderPizza I would like to order {Pizza}

DeliveryAddress {Address}
DeliveryAddress Deliver it to {Address}
DeliveryAddress address is {Address}

```

## 3.进行skill代码编写

```js
const AlexaMessageBuilder = require('alexa-message-builder')
const pizzas = require('./data/pizzas.json')

/**
 * Description 为alexa skill 提供的lambda处理函数
 * @param {any} event alexa预处理的语音事件
 * @param {any} context
 * @param {any} callback    
 * @returns {any} 语音回复消息
 */
function alexaSkill(event, context, callback) {
    const TypeRequest = ['LaunchRequest', 'IntentRequest', 'SessionEndedRequest']
    if (!event || !event.request || TypeRequest.indexOf(event.request.type) < 0) {
        // 检查消息是否为Alexa事件，否则返回错误
        return callback('not valid Alexa request')
    }
    const message = new AlexaMessageBuilder() //创建Builder实例
    const pizzaNames = pizzas.map(pizza => pizza.name)
    console.log(pizzaNames)
    if (event.request.type === "LaunchRequest" || event.request.type === "IntentRequest" //检查消息是否为结束前语句
        &&
        //  检查消息是否为ListPizza意图
        event.request.intent.name === 'ListPizzas') {
        //返回披萨列表
        message.addText(`You can order: ${pizzaNames.toString()}. Which one do you want?`)
            // 并保持会话打开
            .keepSession()
    } else if (event.request.type === 'IntentRequest' && event.request.intent.name === "orderPizza" &&
        pizzaNames.indexOf(event.request.intent.slots.Pizza.value) > -1) {
        const pizza = event.request.intent.slots.Pizza.value
        message.addText(`What's the address where your ${pizza} should be delivered?`)
            .addSessionAttribute('pizza', pizza) //将披萨信息保存到session中以便下一步保存订单取用
            .keepSession() //保持会话不关闭以便下一步处理地址信息
    } else if (
        event.request.type === 'IntentRequest' &&
        event.request.intent.name === 'DeliveryAddress' &&
        event.request.intent.slots.Address.value //用户提供的地址不为空
    ) {
        // save pizza order 这里应该调用保持披萨订单函数
        // 告诉用户订单已经收到
        message.addText(`Thanks for ordering pizza. Your order is processed and pizza should be delivered shortly`)
    } else {
        // 告诉用户有错误，提示重新尝试
        message.addText('Oops, it seems there was a problem, please try again')
    }
    callback(null, message.get()) //从AWS lambda函数返回消息
}
exports.handler = alexaSkill
```



## 4.部署到AWS

```js
"scripts": {
    "create": claudia create //创建lambda函数 
       		 --region eu-west-1 
        		--handler skill.handler 	//设置处理函数的路径
                    --version skill,		//因为不允许使用默认的latest阶段，想要设置其他版本名称，这里是skill
    "allowTrigger": claudia allow-alexa-skill-trigger	//允许Alexa触发lambda函数
        			--version skill,	
    "update": "claudia update --version skill"	
  },
```

# 👓测试无服务器应用

## 1.使用Jasmine测试api

在要本测试的项目文件夹中创建spec文件，这个文件夹将包括披萨服务器API的所有规范，包括单元测试和集成规范，还包括jasmine运行器和一些助手的配置

```js
//创建jasmine.json，进行运行器配置
{
    "spec_dir": "spec",			//相对于项目根目录，将spec位置设置为specs文件夹
    "spec_files": [
        "**/*[sS]pec.js"		//所有sepc文件名都将以spec.js或Spec.js结尾
    ]
}
```

```js
//批准jasmine运行器文件
/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-27 20:28:44
 * @LastEditTime: 2023-07-27 21:11:36
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @FilePath: \pizza-server-AWS\spec\support\jasmine-runner.js
 * @Description: jasmine运行器
 */
const Jasmine = require('jasmine')
const SpecReporter = require('jasmine-spec-reporter').SpecReporter
const jrunner = new Jasmine() //创建一个jasmine实例
const path = require('path')
let filter //filter变量
//从执行的命令中获取除前两个参数外的所有参数，并循环遍历参数列表
process.argv.slice(2).forEach(option => {
    // 如果传递的参数已满，则删除默认报告器并添加jasmine spec报告器
    if (option === 'full') {
        jrunner.configureDefaultReporter({
            print() {}
        })
        jasmine.getEnv().addReporter(new SpecReporter())
    }
    // 如果传递的参数是过滤器，就将过滤器的值保存到filter变量中
    if (option.match('^filter=')) {
        filter = option.match('^filter=(.*)')[1]
    }
});
// 从jasmine.json加载配置文件
jrunner.loadConfigFile()
// 使用提供的过滤器启动jasmine运行器
jrunner.execute(undefined, filter)
```

## 2.运行测试脚本

```js
//在package.json中添加测试脚本
"scripts": {
    "test": "node spec/support/jasmine-runner.js",	//要运行具有完整信息输出的spec，要这样执行：npm run test --full 因为后面的选项不是npm选项，会被直接传递给jasmine
    "debug": "node debug spec/support/jasmine-runner.js"	//使用node.js调试器
}
```

## 3.单元测试

为需要被测试的函数编写单独的测试文件，并以.spec.js结尾

### 3.1本地运行函数单元测试

```js
/*
 * @FilePath: \pizza-server-AWS\spec\handlers\get-pizzas.spec.js
 * @Description: 对get-pizzas函数的单元测试
 */
const underTest = require("../../handler/get-pizzas") //引入需要接受测试的函数
const pizzas = [{ //测试使用的模拟数据数组
        id: 1,
        name: 'Capricciosa'
    },
    {
        id: 2,
        name: 'Napoletana'
    }
]
describe('Get pizzas handler', () => { //描述spec组
    // 1.在没有id的情况下调用getPizzas处理函数的spec
    it('should return a list of all pizzas if called without pizza ID', () => { //接收两个参数，一个为描述理想返回信息，第二个为被测试函数调用
        expect(underTest(null, pizzas)) //调用函数接收测试
            .toEqual(pizzas)    //和预先输入的pizzas数据进行进行对比，不相同返回报错信息，
        expect(underTest(undefined, pizzas))
            .toEqual(pizzas)
    })
    // 2.在使用有效的现有id调用getPizzas函数的spec
    it('should return a single pizza if the existing id is passed as a first parameter', () => {
        expect(underTest(1, pizzas)).toEqual(pizzas[0])
        expect(underTest(2, pizzas)).toEqual(pizzas[1])
    })
    // 3.使用无效或不存在的id调用getPizzas函数的spec
    it('should throw an error if non-existing ID is passed', () => {
        expect(() => underTest(0, pizzas)).toThrow('The pizza you requested was not found')
        expect(() => underTest(3, pizzas)).toThrow('The pizza you requested was not found')
        expect(() => underTest(1.5, pizzas)).toThrow('The pizza you requested was not found')
        expect(() => underTest(42, pizzas)).toThrow('The pizza you requested was not found')
        expect(() => underTest('A', pizzas)).toThrow('The pizza you requested was not found')
        expect(() => underTest([], pizzas)).toThrow('The pizza you requested was not found')
    })
})
```

![image-20230728122411898](C:\Users\刘永杰\AppData\Roaming\Typora\typora-user-images\image-20230728122411898.png)

​																	(全部通过测试截图)

![image-20230728122832472](C:\Users\刘永杰\AppData\Roaming\Typora\typora-user-images\image-20230728122832472.png)

​																	（第三个spec函数没有通过测试）

### 3.2模拟无服务器函数的单元测试

为了模拟aws环境和不想生产环境发起请求，我们需要使用伪造的https请求和docClient对象

```js
const underTest = require("../../handler/create-order")
const https = require('https')
const faeHttpRequest = require("fake-http-request")
const AWS = require("aws-sdk")
const fakeHttpRequest = require("fake-http-request")
let docClientMock

describe('Create order handler', () => {
    beforeEach(() => { //在每个spec执行前执行一些操作
        fakeHttpRequest.install('https') //在https上安装fake-http-request库
        docClientMock = jasmine.createSpyObj('docClient', {	//创建jasmine spy对象到伪造的docClient
            put: {
                promise: Promise.resolve.bind(Promise) //模拟输入和配置函数
            },
            configure() {}
        })
        AWS.DynamoDB.DocumentClient.prototype = docClientMock //使用jasmine spy 替换DocumentClient类
    })
    afterEach(() => faeHttpRequest.uninstall("https")) //在每个spec执行后执行一些操作，卸载fake-http-request库

    // 1.检查不合格请求是否触发异常
    it('should throw an error if request is not valid', () => {
        expect(() => underTest()).toThrow()
        expect(() => underTest({})).toThrow()
        expect(() => underTest('A')).toThrow()
        expect(() => underTest(1)).toThrow()
        expect(() => underTest({
            body: {}
        })).toThrow()
        expect(() => underTest({
            body: {
                pizza: 1
            }
        })).toThrow()
        expect(() => underTest({
            body: {
                address: '221b Baker Street'
            }
        })).toThrow()
    })
    // 2.是否将post请求发送给第三方api
    it('should send post request to Some Like It Hot delivery API', (done) => { //调用正在测试的处理函数
        underTest({
            body: {
                pizza: 1,
                address: '221b Baker Street'
            }
        })
        https.request.pipe((callOption) => { //使用fake-https-request向http.request添加pipe方法，可以使用pipe方法检查https请求是否使用期望值发送
            expect(https.request.calls.length).toBe(1) //检查是否只发送了一个请求
            expect(callOption).toEqual(jasmine.objectContaining({ //使用jasmine.objectContaining比较，对callOption请求与预期对象进行比较
                protocol: "https",
                slashes: true,
                host: 'some-like-it-hot-api.effortlessserverless.com',
                path: "/delivery",
                method: post,
                headers: {
                    Authorization: 'aunt-marias-pizzeria-1234567890',
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    pickupTime: '15.34pm',
                    pickupAddress: 'Aunt Maria Pizzeria',
                    deliveryAddress: '221b Baker Street',
                    webhookUrl: 'https://g8fhlgccof.execute-api.eu-central-1.amazonaws.com/latest/delivery'
                })
            }))
            done() //告诉jasmine异步spec已经完成
        })
    })
    // 3.测试docClient是否在http请求后调用
    it('should call the DynamoDB DocumentClient.put if Some Like It Hot delivery API request was successful', (done) => {
        underTest({
                body: {
                    pizza: 1,
                    address: '221b Baker Street'
                }
            })
            .then(() => {
                expect(docClientMock.put).toHaveBeenCalled() //检查如果函数成功解决，docClientMock.put是否被调用
                done() //告诉jasmine异步spec已经完成
            })
            .catch(done.fail) //告诉jasmine，如果函数被拒绝，异步spec失败
        // 为了测试需要，通过在pipe方法中添加模拟第三方api成功的响应
        https.request.pipe((callOption) => https.request.calls[0].respond(200, "OK", "{}"))
    })
    // 4.测试如果http请求失败，docClient模拟将不会被调用
    it('should not call the DynamoDB DocumentClient.put if Some Like It Hot delivery API request was not successful', (done) => {
        underTest({
                body: {
                    pizza: 1,
                    address: '221b Baker Street'
                }
            })
            // 告诉jasmine，如果函数向下进一步运行，说明异步测试就失败了
            .then(done.fail)
            .catch(() => {
                // 检查如果进一步运行被拒绝，docClientMock.put不会被调用
                expect(docClientMock.put).not.toHaveBeenCalled()
                // 异步测试完成
                done()
            })
        // 模拟外部api调用失败
        https.request.pipe((callOption) => https.request.calls[0].respond(500, 'Server error', '{}'))
    })
    // 5.测试函数在前置请求一切顺利的情况下最后是否成功返回resolve的Promise
    it('should resolve the promise if everything went fine', () => {
        underTest({
                body: {
                    pizza: 1,
                    address: '221b Baker Street'
                }
            })
            .then(done) //成功完成
            .catch(done.fail) //程序抛出异常，就通知jasmine异步测试失败
        https.request.pipe((callOptions) => https.request.calls[0].respond(200, 'Ok', '{}'))
    })
    // 6.测试函数在前置请求不成功的情况下最后是否成功返回reject的Promise
    it('should reject the promise if something went wrong', (done) => {
        underTest({
                body: {
                    pizza: 1,
                    address: "221b Baker Street"
                }
            })
            .then(done.fail) //程序进入resolve，通知jasmine异步测试失败
            .catch(done) //测试成功完成
            https.request.pipe((callOptions) => https.request.calls[0].respond(500, 'Server Error', '{}'))
    })
})
```

## 4.集成测试

前面的单元测试模拟的连接外部api，但是函数没有和AWS进行集成，依然无法判断是否正确，这里我们可以借助AWS-SDK的模块函数为模拟函数运行环境创造条件，而不与真实lambda函数产生联系从而产生费用

```js
/*
 * @FilePath: \pizza-server-AWS\spec\handlers\create-order-integration.spec.js
 * @Description: 为createOrder处理函数的集成测试
 */
const underTest = require("../../handler/create-order")
const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB({ //创建dynamodb类的实例
    apiVersion: "2023-7-28",
    region: "eu-central-1"
})
const https = require('https')
const fakeHttpRequest = require("fake-http-request")

const tableName = `pizzaOrderTest${new Date().getTime()}` //生产测试dynamodb表名
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000 //将jasmine运行器的超时时间

describe("Create Order (integration)", () => {
    beforeAll((done) => { //进行所有测试之前创建dynamodb表
        const params = { //设置dynamodb表配置
            AttributeDefinitions: [{ //表的属性
                AttributeName: "orderId",
                AttributeType: "S" //字符串属性
            }],
            KeySchema: [{ //将orderId设置为主键
                AttributeName: "orderId",
                KeyType: "HASH"
            }],
            ProvisionedThroughput: { //控制读写容量都为1，可以满足测试需要了
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
            },
            tableName: tableName //设置表名
        }
        // 在所有spec之前创建新的dynamodb表
        dynamodb.createTable(params).promise()
            .then(() => dynamodb.waitFor('tableExists', { //使用waitFor方法确保表在jasmine done回调之前存在
                tableName: tableName
            }).promise())
            .then(done) //     异步完成，成功
            .catch(done.fail) //创建失败，通知jasmine异步失败
    })
    afterAll(done => {
        dynamodb.deleteTable({
                TableName: tableName
            }).promise()
            .then(() => dynamodb.waitFor("tableNotExists", { //使用waitFor方法确保表在jasmine done回调之后销毁
                TableName: tableName
            }).promise())
            .then(done)
            .catch(done.fail)
    })

    beforeEach(() => fakeHttpRequest.install({
        type: "https",
        matcher: /some-like-it-hot-api/
    }))
    afterEach(() => fakeHttpRequest.uninstall('https'))

    it('should save the order in the DynamoDB table if Some Like It Hot delivery API request was successful', (done) => {
        underTest({
                body: {
                    pizza: 1,
                    address: '221b Baker Street'
                }
            }, tableName)
            .then(rawResponse => JSON.parse(rawResponse.body))
            .then(response => {
                const params = {
                    Key: {
                        orderId: {
                            S: response.deliveryId
                        }
                    },
                    TableName: tableName
                }
                dynamodb.getItem(params).promise() //从测试数据库中通过id获取条目
                    .then(result => {
                        console.log(result)
                        // 检查数据库中的数据是否正确，并将测试标记为已完成
                        expect(result.Item.orderId.S).toBe(response.deliveryId)
                        expect(result.Item.address.S).toBe('221b Baker Street')
                        expect(result.Item.pizza.N).toBe('1')
                        done()
                    })
                    .catch(done.fail)   //被拒绝，就把测试标记为失败
            })
            .catch(done.fail)
        // 模拟第三方api的成功响应并返回交付id
        https.request.pipe((callOptions) => https.request.calls[0].respond(200, 'Ok', JSON.stringify({
            deliveryId: 'order-id-from-delivery-api'
        })))
    })

})
```

## 5.使用六角架构（Hexagonal Architecture）优化订单保存处理程序

```js
//分离数据库保存过程，独立为一个单独的函数
/*
 * @FilePath: \pizza-server-AWS\handler\Hex-orderRepository.js
 * @Description:数据库保存函数
 */
const AWS = require("aws-sdk")

orderRepository = () => {
    const tableName = 'pizza-orders'
    docClient = new AWS.DynamoDB.DocumentClient({ //初始化docClient类
        region: process.env.region
    })
    this.createOrder = (orderDate) => { //为orderRepository定义createOrder处理函数
        return docClient.put({ //调用docClient.put存储所需要的data
            tableName: tableName,
            Item: {
                cognitoUsername: orderDate.cognitoUsername,
                orderId: orderDate.deliveryId,
                pizza: orderDate.pizza,
                address: orderDate.address,
                orderStatus: orderDate.orderStatus
            }
        })
    }
}
module.exports = orderRepository
```

```js
//在订单保存程序中调用上面的数据库函数
/*
 * @FilePath: \pizza-server-AWS\handler\Hex-create-order.js
 * @Description: 使用六角架构（Hexagonal Architecture）优化的订单保存处理程序
 */
function HexCreateOrder(request, orderRepository) {
    // 移除了AWS DynamoDB 初始化的代码，因为这部分的代码已经移到orderRepository
    let userAddress = request && request.body && request.body.address
    if (!userAddress) {
        const userData = request && request.context && request.context.authorizer && request.context.authorizer.claims
        if (!userData) {
            throw new Error("'To order pizza please provide pizza type and address where pizza should be delivered")
        }
        userAddress = JSON.parse(userData.address)
    }
    return rp.post("https://fake-delivery-api.effortlessserverless.com/delivery", {
            headers: {
                Authorization: 'aunt-marias-pizzeria-1234567890',
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                pickupTime: '15.34pm',
                pickupAddress: 'Aunt Maria Pizzeria',
                deliveryAddress: userAddress,
                webhookUrl: 'https://g8fhlgccof.execute-api.eu-central-1.amazonaws.com/latest/delivery', //用于发送传递状态更新
            })
        })
        .then(rawResponse => JSON.parse(rawResponse))
        .then(response => {
            orderRepository.createOrder({
                cognitoUsername: request.cognitoUsername,
                orderId: response.deliveryId,
                pizza: request.body.pizza,
                address: userAddress,
                orderStatus: 'pending'
            }).promise()
        })
        .then(res => {
            console.log('Order is saved!', res)

            return res
        })
        .catch(saveError => {
            console.log(`Oops, order is not saved :(`, saveError)
            throw saveError
        })
}
module.exports=HexCreateOrder
```

## ６．测试API路径

```js
/*
 * @Description: 测试api路径，不放入handlers文件夹中，因为没有测试处理函数
 */
const underTest = require("../api")
describe("API", () => {
    [{ //定义现有路径的数组
        path: '',
        requestTypes: ['GET']
    }, {
        path: 'pizzas', //没有斜杠的路径，因为Claudia api builder会以没有斜杠的方式存储
        requestTypes: ['GET']
    }, {
        path: 'orders',
        requestTypes: ['POST']
    }, {
        path: 'orders/{id}',
        requestTypes: ['PUT', 'DELETE']
    }, {
        path: 'delivery',
        requestTypes: ['POST']
    }, {
        path: 'upload-url',
        requestTypes: ['GET']
    }].forEach(route => {
        it(`should setup /${route.path}`, () => {   //为数组中的每个路径调用it函数
            // 使用Claudia api builder的apiConfig方法获得带有路径数组的api配置
            expect(Object.keys(underTest.apiConfig().routes[route.path]))
            .toEqual(route.requestTypes)    //测试路径是否使用预期的方法定义
        })
    })
})
```

# 💰使用Stripe添加在线支付功能

## 1.设置stripe账户和检索stripe密钥

注册stripe账户后使用stripe dashboard 从导航菜单中选择AP选择，选择选择标准密钥，生成两个标准API密钥：可发布密钥和秘密密钥。

- 可发布密钥：可作为前端web应用或移动应用的公钥
- 秘密密钥为应用或API提供对stripe资源的访问



![](C:\Users\刘永杰\Desktop\stripe收费流程.jpg)

## 2.实现支付服务

创建支付表单页面

```html
<!--
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-29 18:39:06
 * @LastEditTime: 2023-07-29 18:47:23
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @FilePath: \serverless-payment\web\payment.html
 * @Description: 支付表单示例，不是lambda函数的一部分，只供前端web页面使用
-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>payment</title>
</head>
<body>
    <form action="<paste-here-your-lambda-function-url>" method="post">	//表单action填入我们自己的lambda函数url
        <script src="https://checkout.stripe.com/checkout.js" 
        class="stripe-button"
        data-key="<your-stripe-public-key>"	//stripe公钥
        data-amount="100"		//收费额度
        data-name="Demo site"   //stripe支付窗口名称
        data-description="2 widgets"	//stripe 支付交易描述
        data-image="https://stripe.com/img/documentation/checkout/marketplace.png"	//表单显示徽标
        data-locale="auto"	//指定语言环境
        data-zip-code="true"	//检查邮政编码
        data-currency="usd"	//货币短代码
        >
        </script>
    </form>
</body>
</html>
```

使用六角架构实现订单支付和订单支付状态跟新

```js
/*
 * @FilePath: \serverless-payment\payment.js
 * @Description: 主服务文件，使用API builder 构建一个公开的post节点
 */
const ApiBuilder = require('claudia-api-builder')
const api = new ApiBuilder()
const createCharge = require("./create-charge")
const paymentRepository = require("./repositories/payment-repository")

api.post("/create-charge", request => { //创建订单的API
    let paymentRequest = { //创建参数对应，以供createCharger方法使用
        token: request.body.key,
        amount: request.body.amount,
        currency: request.body.currency,
        orderId: request.body.metadata
    }
    return createCharge(paymentRequest) //调用createCharge方法
        .then(charge => { // 如果成功了，发送成功信息
            return {
                message: "Payment Initiated!",
                charge: charge
            }
        }).catch(err => { //在出现错误的情况下，返回带有错误的消息
            return {
                message: 'Payment Initialization Error',
                error: err
            }
        })
})
api.get("/charges", request => { //设置获得所有支付订单的api端点
    return paymentRepository.getAllCharges() //调用getAllCharges方法，得到支付列表数据
        .catch(err => { //如果不超过，发送错误
            return {
                message: 'Charges Listing Error',
                error: err
            }
        })
})
module.exports = api
```

```js
/*
 * @FilePath: \serverless-payment\create-charge.js
 * @Description: 负责创建支付费用的业务逻辑
 */
const paymentRepository = require("./repositories/payment-repository")
const orderRepository = require("./repositories/order-reposityory")
module.exports = function (paymentRequest) {
    let paymentDescription = 'Pizza Order payment'  //提供收费说明
    return paymentRepository.createCharge(paymentRequest.token, paymentRequest.amount, paymentRequest.currency, paymentDescription) //调用createCharge函数
        .then(() => orderRepository.updateOrderStatus(paymentRequest.orderId))//调用createCharge函数成功后更新披萨订单支付状态
}
```

```js
/*
 * @FilePath: \serverless-payment\repositories\order-reposityory.js
 * @Description: 负责与AWS DynamoDB通信，并且使用新处理后的付款消息更新披萨订单
 */
const AWS = require("aws-sdk")
const doClient = new AWS.DynamoDB.DocumentClient()
module.exports = {
    updateOrderStatus: function (orderId) {
        return doClient.put({
            TableName: 'pizza-orders',
            Key: {
                orderId: orderId
            },
            UpdateExpression: 'set orderStatus = :s',
            ExpressionAttributeValues: {
                ':s': 'paid'
            }
        }).promise()
    }
}
```

```js
/*
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
```

## 3.部署到AWS

```js
"scripts": {
        "create": claudia create --region eu-central-1 
            	--api-module payment 
                    --set-env STRIPE_SECRET=<type in your Stripe Secret Key>>,//将密钥部署到生产环境中，以供实例化stripe sdk
        "update": claudia update --cache-api-config apiConfig --no-optional-dependencies
    },
```

# ✈将现有的express.js应用迁移到aws lambda

## 1.无服务器express应用工作流程

![](C:\Users\刘永杰\Desktop\无服务器express应用流程.jpg)



## 2.对原有代码进行修改和编写封装器

对现有的express应用进行一些适应性修改

```js
/*
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
```

```js
/*
 * @FilePath: \simple-express-app\app.local.js
 * @Description: 本地运行封装好的express应用
 */
const app = require("./app")
const port = process.env.port || 3000

app.listen(port, () => console.log(`App listening on port ${port}`))
```

```js
/*
 * @FilePath: \simple-express-app\lambda.js
 * @Description: 用于express应用的aws lambda封装器,会在aws lambda中运行express应用，理论上使用claudia generate-serverless-express-proxy命令可以自动生成
 */
const awsServerlessExpress = require("aws-serverless-express")
const app = require('./app')
const binaryMineTypes = [   //白名单，mime类型将被转换并传递给express应用
    'application/octet-stream',
    'font/eot',
    'font/opentype',
    'font/otf',
    'image/jpeg',
    'image/png',
    'image/svg+xml'
]
const server = awsServerlessExpress.createServer(app, null, binaryMineTypes)    //首先使用createServer函数启动express应用中的lambda函数
exports.handler = (event, context) => awsServerlessExpress.proxy(server, event, context)    //  使用proxy函数将API gateway请求转为http请求并传递给express应用，转换响应后传递回API gateway
```

## 3.部署到aws lambda

```js
"scripts": {
        "create": claudia create 
           				 --handler lambda.handler 	//不同于原来的--api-module选项来调用
                		 --deploy-proxy-api 	//设置代理集成，对api gateway的所有请求将直接传递到lambda函数
                    	 --region eu-central-1,
        "generate-proxy-wrapper": claudia generate-serverless-express-proxy //为express应用模块生成lambda封装器
            					--express-module app	//提供express应用的模块名，以便生成
        "update": claudia update --timeout 10 	//设置超时时间为10秒
            					--set-env-from-json env.json	//将本地编写的json环境变量部署更新
    },
```

# 🚀项目总结

![](C:\Users\刘永杰\Desktop\总体架构图.jpg)

​																														（总体架构图）
