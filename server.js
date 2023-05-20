const express = require("express");
const app = express();
const port = process.env.PORT || 3099;
const staticRoutes = require("./routes/staticRoutes");
app.use(express.json());
app.use(express.static("public"));

app.use("/", staticRoutes);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
