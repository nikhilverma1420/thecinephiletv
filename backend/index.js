const express = require("express");
const app = express();
const PORT = 5000;

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.get("/a", (req, res) => {
  res.send("testing nodemon")
})

app.get("/b", (req, res) => {
  res.send("testing nodemon again")
})

app.get("/c", (req, res) => {
  res.send("testing nodemon again c")
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
