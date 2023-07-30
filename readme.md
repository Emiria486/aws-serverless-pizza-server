# ✈项目简介

## Chinese：

一个基于Claudia.js和AWS-SDK支持的nodeJS后端服务器，能解决处理为web页面提供API服务，在线支付，提供sms短信订购bot，facebook订购聊天bot，到Alex聊天订购bot，几乎涵盖了个人小型商业开店的所有服务器端需求。

事实上我们正是以一个个人披萨店的在线销售作为开发场景！

上述服务将可以运行在由AWS Web Services提供服务的AWS lambda函数，帮助你更加高效和节省的完成一个或多个的网络服务需求。

## Japanese：

Claudia.jsとAWS-SDKに基づいたNode.jsベースのバックエンドサーバーは、ウェブページにAPIサービスを提供し、オンライン決済、SMSメッセージ注文ボット、Facebookチャット注文ボット、Alexaチャット注文ボットなどの処理を行うことができます。これにより、個人や小規模なビジネスのオンラインショップに必要なほぼすべてのサーバーサイドの要件をカバーすることができます。

実際には、私たちは個人のピザ店のオンライン販売を開発シナリオとして採用しています！

上記のサービスは、AWS Web Servicesが提供するAWS Lambda関数で実行することができます。これにより、1つまたは複数のネットワークサービス要件をより効率的に実現し、コストを節約することができます。

## English：

A nodeJS backend server based on Claudia.js and AWS-SDK support is able to handle web API services, online payments, SMS messaging bot for order placement, Facebook chat bot, and Alexa language chat bot, covering almost all server-side requirements for personal and small-scale businesses.

In fact, we are using online pizza sales for a personal pizza shop as the development scenario!

The aforementioned services can be run on AWS Lambda functions provided by AWS Web Services, helping you efficiently and cost-effectively fulfill one or multiple network service requirements.

# 👀项目架构说明

![](https://user-images.githubusercontent.com/87558503/256989325-44d5d234-508d-4fcf-a346-9c32c8e1f517.jpg)

## Chinese：

本应用分为三层：存储层，业务层和API控制器层

底层数据库使用AWS Dynamo DB保存订单消息。文件则使用AWS S3进行云端存储。

业务层包括

1. 创建保存订单，更新完成状态，订单支付状态，向第三方外卖提交订单等一系列订单相关处理
2. 与stripe对接完成在线支付餐费
3. 创建Facebook聊天机器人，与Facebook messenger对接完成用户在线订单
4. 创建Twilio短信聊天机器人，让用户可以发送短信下单购买
5. 创建Alexa skill让用户可以通过一系列智能设备，使用语音下单购买
6. 对我们的披萨图片进行大小调整和云存储

API控制器层包括：对web网页和移动端的接口，在线支付的接口，sms聊天机器人的接口，Facebook bot的接口

## Japanese：

本アプリケーションは3つのレイヤーに分かれています：ストレージレイヤー、ビジネスレイヤー、およびAPIコントローラーレイヤー。

ボトムレイヤーのデータベースはAWS Dynamo DBを使用して注文メッセージを保存します。ファイルはAWS S3を使用してクラウドストレージされます。

ビジネスレイヤーには以下が含まれます：

1. 注文の作成、完了ステータスの更新、注文の支払い状況、第三者のデリバリーサービスに注文を送信するなど、注文に関連する一連の処理
2. stripeとの連携によるオンラインでの支払い処理
3. Facebookチャットボットの作成とFacebook Messengerとの連携によるユーザーのオンライン注文処理
4.  TwilioのSMSチャットボットの作成により、ユーザーはSMSで注文を送信できるようにする
5.  Alexaスキルの作成により、ユーザーは一連のスマートデバイスを通じて音声で注文をすることができる
6. ピザの画像のサイズ変更とクラウドストレージの作成

APIコントローラーレイヤーには、ウェブページとモバイルアプリのインターフェース、オンライン支払いのインターフェース、SMSチャットボットのインターフェース、Facebookボットのインターフェースが含まれます。

## English：

This application is divided into three layers: storage layer, business layer, and API controller layer.

The bottom layer database uses AWS Dynamo DB to store order messages. Files are stored in the cloud using AWS S3.

The business layer includes:

1. Creating and saving orders, updating completion status and payment status, submitting orders to third-party delivery services, and other related order processing.
2. Integrating with Stripe to complete online payment for meals.
3. Creating a Facebook chatbot and integrating with Facebook Messenger to handle user online orders.
4. Creating a Twilio SMS chatbot to allow users to place orders and make purchases via text messages.
5. Creating an Alexa skill to allow users to place orders and make purchases using voice commands through a series of smart devices.
6. Resizing and storing our pizza images in the cloud.

The API controller layer includes interfaces for web pages, mobile apps, online payment, SMS chatbots, and Facebook bots.

# 🎈部署和项目说明

## Chinese：

​		本应用是基于serverless思想构思开发的应用，你可以将代码下载后结合aws web serivce部署为你自己的服务器应用，事实上每一个文件夹都可以在部署后视为一个独立的AWS lambda函数服务，这样可以降低系统的耦合度，方便后续的扩展和维护。

​		pizza-alexa-skill：为Alexa skill 应用的服务端和你可能会需要使用到的Alexa配置文件。

​		pizza-fb-chatbot：为Facebook bot 应用的服务端和你可能会需要使用到的dynamoDB配置文件。

​		pizza-image-processor:配置ImageMagick服务转化披萨图片大小并存储到AWS S3

​		pizza-server-AWS：为web和移动应用提供订单相关的api接口

​		serverless-payment：与stripe对接的在线支付服务端

​		sms-chatbot：与Twilio对接的SMS短信聊天服务端

​	Tip：simple-express-app是一个例外，它是一个简短的将现有的express.js应用迁移到AWS lambda上的例子，你可以通过这个简要的了解如何迁移现有的应用到AWS上。

**如何部署项目？**

​	安装aws cli 和Claudia.js，按照package.json的scripts运行即可。

## Japanese：

本アプリケーションは、サーバーレスの考え方に基づいて設計・開発されたアプリケーションです。コードをダウンロードし、AWS Webサービスと組み合わせて、独自のサーバーアプリケーションとしてデプロイすることができます。実際には、各フォルダはデプロイ後、独立したAWS Lambda関数サービスとして扱うことができます。これにより、システムの結合度を低くし、拡張やメンテナンスを容易にすることができます。

- pizza-alexa-skill: Alexaスキルアプリのサーバーサイドと、Alexaの設定ファイルを使用する可能性があります。
- pizza-fb-chatbot: Facebookボットアプリのサーバーサイドと、dynamoDBの設定ファイルを使用する可能性があります。
- pizza-image-processor: ImageMagickサービスを使用してピザ画像のサイズを変換し、AWS S3に保存するための設定です。
- pizza-server-AWS: Webおよびモバイルアプリに注文関連のAPIインターフェースを提供します。
- serverless-payment: Stripeと連携したオンライン決済のサーバーサイドです。
- sms-chatbot: Twilioと連携したSMSチャットのサーバーサイドです。

ヒント：simple-express-appは例外であり、既存のexpress.jsアプリケーションをAWS Lambdaに移行するための短い例です。この例を通じて、既存のアプリケーションをAWS上に移行する方法を簡単に理解することができます。

プロジェクトのデプロイ方法は次の通りです。

AWS CLIとClaudia.jsをインストールし、package.jsonのスクリプトに従って実行してください。

## English：

This application is developed based on the serverless concept. After downloading the code, you can deploy it as your own server application by combining it with AWS web services. In fact, each folder can be treated as an independent AWS Lambda function service after deployment, which can reduce the coupling of the system and facilitate future expansion and maintenance.

- pizza-alexa-skill: The server-side of Alexa skill application and the Alexa configuration file that you may need to use.
- pizza-fb-chatbot: The server-side of Facebook bot application and the dynamoDB configuration file that you may need to use.
- pizza-image-processor: Configures ImageMagick service to resize pizza images and store them in AWS S3.
- pizza-server-AWS: Provides API interfaces related to orders for web and mobile applications.
- serverless-payment: Online payment server that integrates with Stripe.
- sms-chatbot: SMS chat server that integrates with Twilio.

Tip: simple-express-app is an exception. It is a short example of migrating an existing express.js application to AWS Lambda. You can use this example to understand how to migrate existing applications to AWS.

How to deploy the project?

Install AWS CLI and Claudia.js, and run according to the scripts in package.json.