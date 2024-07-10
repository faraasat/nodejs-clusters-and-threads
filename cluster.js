// cluster.js

import express from "express";

const PORT = 5050; // port number to run the server

const app = express();

app.get("/", (req, res) => {
  let total = 0;
  for (let i = 0; i < 50_000_000; i++) {
    total++;
  }
  res.send(`The result of task is ${total}\n`);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`worker pid is ${process.pid}`);
});
