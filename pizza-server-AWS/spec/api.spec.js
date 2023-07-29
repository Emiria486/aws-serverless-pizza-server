/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-29 11:21:52
 * @LastEditTime: 2023-07-29 11:51:06
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @FilePath: \pizza-server-AWS\spec\api.spec.js
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