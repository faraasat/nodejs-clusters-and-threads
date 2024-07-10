// worker.js

const { parentPort } = require("node:worker_threads");

let i = 0;
while (i < 10_000_000_000) {
  i++;
}

parentPort.postMessage(i);
