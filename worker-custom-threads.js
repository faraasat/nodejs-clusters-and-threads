const { workerData, parentPort } = require("node:worker_threads");

// workerData is the data passed to the worker thread
let i = 0;
while (i < 10_000_000_000 / workerData.thread_count) {
  i++;
}

parentPort.postMessage(i);
