require('dotenv').config()
const soap = require('soap');
const { response } = require('express');
const freepaidURL = 'http://ws.dev.freepaid.co.za/airtimeplus/?wsdl';
const args = { request: { user: process.env.DEV_FREEPAID_USER, pass: process.env.DEV_FREEPAID_PASS } }
const placeOrderArgs = {
    request: {
        user: process.env.DEV_FREEPAID_USER,
        pass: process.env.DEV_FREEPAID_PASS,
        refno: 'test-ref-001',
        network: 'vodacom',
        sellvalue: 2,
        count: 1,
        extra: 'phone_number',
    }
}

module.exports.fetchAllProducts = async () => {
    var client = await soap.createClientAsync(freepaidURL);
    var result = await client.fetchProductsAsync(args);

    const products = result[0].reply.products.item.map(prod => {
        const product = {
            description: prod.description['$value'],
            network: prod.network['$value'],
            costprice: prod.costprice['$value'],
            sellprice: prod.sellvalue['$value'],
            groupname: prod.groupname['$value']
        };
        return product
    });
    // console.log(products);
    return products;
}


placeOrder = async (placeOrderArgs) => {
    var client = await soap.createClientAsync(freepaidURL);
    var result = await client.placeOrderAsync(placeOrderArgs);
    // console.log(result);
    const order = {
        status: result[0].reply.status["$value"],
        errorcode: result[0].reply.errorcode["$value"],
        message: result[0].reply.message["$value"],
        balance: result[0].reply.balance["$value"],
        orderno: result[0].reply.orderno["$value"]
    };
    console.log(order);
    return order;
}
// placeOrder(placeOrderArgs)

module.exports.fetchOrder = async (orderno) => {
    args.request.orderno = orderno
    var client = await soap.createClientAsync(freepaidURL);
    var result = await client.fetchOrderAsync(args);
    // console.log(result);

    const order = {
        status: result[0].reply.status["$value"],
        errorcode: result[0].reply.errorcode["$value"],
        message: result[0].reply.message["$value"],
        balance: result[0].reply.balance["$value"],
        orderno: result[0].reply.orderno["$value"],
        voucher: {
            network: result[0].reply.vouchers.item.network["$value"],
            sellvalue: result[0].reply.vouchers.item.sellvalue["$value"],
            pin: result[0].reply.vouchers.item.pin["$value"],
            serial: result[0].reply.vouchers.item.serial["$value"],
            costprice: result[0].reply.vouchers.item.costprice["$value"]
        }
    };
    // console.log(order);
    return order;
}
// fetchOrder("2023060409530172")