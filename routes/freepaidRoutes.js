const express = require('express')
const router = express.Router()
const { response } = require('express')
const freepaid = require('../freepaid')
const app = express()
app.use(express.json())



router
    .get("/freepaid/api", (req, res) => {
        res.send({ status: "🟢", desription: "freePaid API" })
    })
    .get('/freepaid/allProducts', async (req, res) => {
        try {
            const products = await freepaid.fetchAllProducts()
            res.send(products)
        } catch (ex) {
            console.log(ex)
            res.send(ex)
        }
    })

router
    .post("/freepaid/fetchOrder", async (req, res) => {

        const orderNo = req.body.orderno
        try {
            const response = await freepaid.fetchOrder(orderNo)
            const order = {
                orderno: response.orderno,
                network: response.voucher.network,
                sellvalue: response.voucher.sellvalue,
                pin: response.voucher.pin,
                serial: response.voucher.serial
            }
            res.send(order)
        } catch (ex) {
            console.log(ex)
            res.send(ex)
        }

    })

module.exports = router;