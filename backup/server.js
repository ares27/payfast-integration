const axios = require("axios");
const dns = require("dns");
const crypto = require("crypto");
const express = require("express");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 8081;
app.use(express.json());
app.use(express.static("public"));
// app.use(express.static(__dirname));

const pfHost = "sandbox.payfast.co.za";
const generateSignature = (data, passPhrase = null) => {
  // Create parameter string
  let pfOutput = "";
  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      if (data[key] !== "") {
        pfOutput += `${key}=${encodeURIComponent(data[key].trim()).replace(
          /%20/g,
          "+"
        )}&`;
      }
    }
  }

  // Remove last ampersand
  let getString = pfOutput.slice(0, -1);
  if (passPhrase !== null) {
    getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(
      /%20/g,
      "+"
    )}`;
  }

  return crypto.createHash("md5").update(getString).digest("hex");
};

// Verify the signature
const pfValidSignature = (pfData, pfParamString, pfPassphrase = null) => {
  // Calculate security signature
  let tempParamString = "";
  if (pfPassphrase !== null) {
    pfParamString += `&passphrase=${encodeURIComponent(
      pfPassphrase.trim()
    ).replace(/%20/g, "+")}`;
  }

  const signature = crypto
    .createHash("md5")
    .update(pfParamString)
    .digest("hex");
  return pfData["signature"] === signature;
};
// Check that the notification has come from a valid PayFast domain
async function ipLookup(domain) {
  return new Promise((resolve, reject) => {
    dns.lookup(domain, { all: true }, (err, address, family) => {
      if (err) {
        reject(err);
      } else {
        const addressIps = address.map(function (item) {
          return item.address;
        });
        resolve(addressIps);
      }
    });
  });
}
const pfValidIP = async (req) => {
  const validHosts = [
    "www.payfast.co.za",
    "sandbox.payfast.co.za",
    "w1w.payfast.co.za",
    "w2w.payfast.co.za",
  ];

  let validIps = [];
  const pfIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  try {
    for (let key in validHosts) {
      const ips = await ipLookup(validHosts[key]);
      validIps = [...validIps, ...ips];
    }
  } catch (err) {
    console.error(err);
  }

  const uniqueIps = [...new Set(validIps)];

  if (uniqueIps.includes(pfIp)) {
    return true;
  }
  return false;
};

// Compare payment data
const pfValidPaymentData = (cartTotal, pfData) => {
  return (
    Math.abs(parseFloat(cartTotal) - parseFloat(pfData["amount_gross"])) <= 0.01
  );
};

// Perform a server request to confirm the details
const pfValidServerConfirmation = async (pfHost, pfParamString) => {
  const result = await axios
    .post(`https://${pfHost}/eng/query/validate`, pfParamString)
    .then((res) => {
      return res.data;
    })
    .catch((error) => {
      console.error(error);
    });
  return result === "VALID";
};

app.get("/", (req, res) => {
  res.send({ status: "🟢", desription: "Online" });
});

app.get("/success", (req, res) => {
  res.sendFile(__dirname + "/public/pages/success.html");
});

app.get("/cancel", (req, res) => {
  res.sendFile(__dirname + "/public/pages/cancel.html");
});

app.get("/notify", (req, res) => {
  res.sendFile(__dirname + "/public/pages/notify.html");
});

app.post("/form", async (req, res) => {
  const ngrokHost = "78e2-105-224-29-125";
  const myData = [];
  // Merchant details
  myData["merchant_id"] = "10023264";
  myData["merchant_key"] = "0kg0prpdrqwe6";
  myData["return_url"] = req.body.return_url;
  myData["cancel_url"] = req.body.cancel_url;
  myData["notify_url"] = req.body.notify_url;
  myData["name_first"] = req.body.name_first;
  myData["name_last"] = req.body.name_last;
  myData["m_payment_id"] = req.body.m_payment_id;
  myData["amount"] = 5.0;
  myData["amount"] = req.body.amount;
  myData["item_name"] = req.body.itemName;
  // myData["item_name"] = "Order#123";
  // Generate signature
  const myPassphrase = "prepaidApp123";
  myData["signature"] = generateSignature(myData, myPassphrase);

  // let notifyData;
  // if (res.statusCode === 200) {
  //   const resp = await axios.post(
  //     `https://${ngrokHost}.ngrok.io/notify`,
  //     myData
  //   );
  //   notifyData = resp.data;
  //   console.log(resp.data);
  // }

  console.log(`data sent ...`, myData);
  res.send({
    merchant_id: myData["merchant_id"],
    merchant_key: myData["merchant_key"],
    return_url: myData["return_url"],
    cancel_url: myData["cancel_url"],
    notify_url: myData["notify_url"],
    amount: myData["amount"],
    item_name: myData["item_name"],
    signature: myData["signature"],
  });
});

app.get("/form", (req, res) => {
  // Create new file
  // fs.writeFileSync("doc.txt", pfParamString);

  res.send(`
  <div
      class="container"
      style="border: 1px solid coral; display: flex; justify-content: center"
    >
      <form action="https://sandbox.payfast.co.za/eng/process" method="post">
        <h2 style="text-align: center">Form</h2>
        <input type="hidden" name="merchant_id" value="" />
        <input type="hidden" name="merchant_key" value="" />
        <input
          type="hidden"
          name="return_url"
          value="return_url"
        />
        <input
          type="hidden"
          name="cancel_url"
          value="cancel_url"
        />
        <input
          type="hidden"
          name="notify_url"
          value="notify_url"
        />
        <input type="hidden" name="amount" value="" />
        <input type="hidden" name="item_name" value="" />
        <input type="hidden" name="signature"  value=""/>
        <input type="submit" value="Pay Now" />
      </form>
    </div>`);
});

app.post("/notify", (req, res) => {
  res.sendStatus(200);
  if (res.statusCode === 200) {
    let payment = {
      payment_id: req.body.pf_payment_id,
      status: req.body.payment_status,
      orderName: req.body.item_name,
      gross: req.body.amount_gross,
      fee: req.body.amount_fee,
      net: req.body.amount_net,
      name: req.body.name_first,
      last_name: req.body.name_last,
      signature: req.body.signature,
    };
    console.log(res.statusCode, payment);
    // res.send(`
    // <div
    //     class="container"
    //     style="border: 1px solid coral; display: flex; justify-content: center"
    //   >
    //   payment is ${payment}
    //   </div>`);
  }

  // res.sendStatus(200).send(`
  //   <div
  //       class="container"
  //       style="border: 1px solid coral; display: flex; justify-content: center"
  //     >
  //     body is ${req.body}
  //     </div>`);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
