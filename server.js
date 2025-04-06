const express = require("express");
const conversations = require("./src/routes/conversations");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/api", conversations);

app.get("/", (req, res) => {
  res.send("Exabloom BE is running!");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
