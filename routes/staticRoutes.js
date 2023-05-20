const { MongoClient } = require("mongodb");
const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser')
const payfast = require("../payfast")
const uri = "mongodb+srv://user:user@cluster0.ymxzcdp.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
const database = client.db('sample_training');
const myDataCollection = database.collection('data');
const pfHost = "sandbox.payfast.co.za";
const urlencodedParser = bodyParser.urlencoded({ extended: false })


router
    .get("/status", (req, res) => {
        res.send({ status: "🟢", desription: "Online" });
    })
    .get("/success", (req, res) => {
        // res.sendFile(process.env.PWD + "/public/pages/success.html");
        res.sendFile("success.html", { root: "../payfast-integration/public/pages" });
    })
    .get("/cancel", (req, res) => {
        // res.sendFile(process.env.PWD + "/public/pages/cancel.html");
        res.sendFile("cancel.html", { root: "../payfast-integration/public/pages" });
    })
    .get("/notify", (req, res) => {
        res.sendFile("notify.html", { root: "../payfast-integration/public/pages" });
    })
    .get("/mongodb/read", async (req, res) => {
        try {
            const query = { data: { $not: { $eq: "" } } };
            const myDataItems = myDataCollection.find(query);
            const allItems = await myDataItems.toArray()
            // console.log(allItems);
            res.send(allItems)
        } catch (ex) {
            console.log(`error: ${ex}`)
            res.send(ex)
        } finally {
            // await client.close();
        }
    })
    .get('/html', (req, res) => {
        localhost = "http://localhost:3099";
        nghost = "https://087a-105-186-219-244.ngrok-free.app";

        const myData = [];
        // Merchant details
        myData["merchant_id"] = "10023264";
        myData["merchant_key"] = "0kg0prpdrqwe6";
        myData["return_url"] = `${nghost}/success`;
        myData["cancel_url"] = `${nghost}/cancel`;
        myData["notify_url"] = `${nghost}/notify`
        // Buyer details
        // myData["name_first"] = "First Name";
        // myData["name_last"] = "Last Name";
        // myData["email_address"] = "test@test.com";
        // Transaction details
        myData["m_payment_id"] = "1234";
        myData["amount"] = "5.00";
        myData["item_name"] = "Order#123";

        // Generate signature
        const myPassphrase = "prepaid-app-123";
        myData["signature"] = payfast.generateSignature(myData, myPassphrase);
        console.log(myData);
        const pfHost = "sandbox.payfast.co.za";
        let htmlForm = `<form action="https://${pfHost}/eng/process" method="post">`;
        for (let key in myData) {
            if (myData.hasOwnProperty(key)) {
                value = myData[key];
                if (value !== "") {
                    htmlForm += `<input name="${key}" type="hidden" value="${value.trim()}" />`;
                }
            }
        }

        htmlForm += '<input type="submit" value="Pay Now" /></form>';

        res.send(htmlForm);
    })


router
    .post("/mongodb/create", async (req, res) => {
        const title = req.body.title
        try {
            const doc = { title }
            const result = await myDataCollection.insertOne(doc);
            // console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.status(201).send({
                status: "success",
                _id: result.insertedId,
                title: title,
            });

        } catch (ex) {
            console.log(ex);
            res.send(ex);
        } finally {
            // await client.close();
        }
    })
    .post("/notify", urlencodedParser, (req, res) => {
        const pfData = JSON.parse(JSON.stringify(req.body));
        console.log("incoming data...");
        console.log(pfData);
        console.log("incoming data...");


        let pfParamString = "";
        for (let key in pfData) {

            if (pfData.hasOwnProperty(key) && key !== "signature") {
                pfParamString += `${key}=${encodeURIComponent(pfData[key].trim()).replace(/%20/g, "+")}&`;
            }
        }

        // Remove last ampersand
        pfParamString = pfParamString.slice(0, -1);
        console.log(pfParamString);

        const passPhrase = 'prepaid-app-123';
        const check1 = payfast.pfValidSignature(pfData, pfParamString, passPhrase);
        console.log(check1);

        const check2 = payfast.pfValidIP(req);
        console.log(check2);

        const cartTotal = pfData.amount_gross;
        const check3 = payfast.pfValidPaymentData(cartTotal, pfData);
        console.log(check3);

        const check4 = payfast.pfValidServerConfirmation(pfHost, pfParamString);
        console.log(check4);

        // confirm security checks
        if (check1 && check2 && check3 && check4) {
            // All checks have passed, the payment is successful
            console.log('All checks have passed, the payment is successful');
        } else {
            // Some checks have failed, check payment manually and log for investigation
            console.log('Some checks have failed, check payment manually and log for investigation');
        }

        res.send({
            pfParamString: pfParamString,
            check1: check1,
            check2: check2,
            check3: check3,
            check4: check4,
        })
        // res.send(pfParamString);

        // console.log("==req==")
        // console.log(req)
        // console.log("==ITN Received==")
        // console.log({ body: req.body })
        // let payment = {
        //     payment_id: req.body.pf_payment_id,
        //     status: req.body.payment_status,
        //     orderName: req.body.item_name,
        //     gross: req.body.amount_gross,
        //     fee: req.body.amount_fee,
        //     net: req.body.amount_net,
        //     name: req.body.name_first,
        //     last_name: req.body.name_last,
        //     signature: req.body.signature,
        // };
        // console.log("payment: " + JSON.stringify(payment))
        // res.send(`<p>${payment}<p>`)
    })


module.exports = router;