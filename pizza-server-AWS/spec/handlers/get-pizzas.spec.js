/*
 * @Author: Emiria486 87558503+Emiria486@users.noreply.github.com
 * @Date: 2023-07-27 22:12:57
 * @LastEditTime: 2023-07-28 11:26:20
 * @LastEditors: Emiria486 87558503+Emiria486@users.noreply.github.com
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