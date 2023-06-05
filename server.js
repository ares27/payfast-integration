const express = require("express");
const app = express();
const port = process.env.PORT || 3099;
const payfastRoutes = require("./routes/payfastRoutes");
const freepaidRoutes = require("./routes/freepaidRoutes");
app.use(express.json());
app.use(express.static("public"));

app.use("/", payfastRoutes);
app.use("/", freepaidRoutes);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
