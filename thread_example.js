// thread_example.js (main file)

const express = require("express");
const { Worker } = require("node:worker_threads");

const PORT = 5050; // port number to run the server
const THREAD_COUNT = 4; // number of threads to run (we will use them in custom threads route)

const app = express();

// This route will block the event loop and
// will not allow other requests to be processed
app.get("/blocking", (req, res) => {
  let i = 1;
  while (i < 10_000_000_000) {
    i++;
  }
  return res.status(200).send(`Calculation Total is ${i}`);
});

// This route will not block the event loop and
// will allow other requests to be processed
app.get("/non-blocking", (req, res) => {
  // Create a new worker thread
  const worker = new Worker("./worker.js");

  // it will listen to the message event from the worker thread
  worker.on("message", (data) => {
    return res.status(200).send(`Result is ${data}`);
  });

  // it will listen to the error event from the worker thread
  worker.on("error", (err) => {
    console.error("Worker error:", err);
    return res.status(404).send(`Error Occurred: ${err.message}`);
  });

  // it will listen to the exit event from the worker thread
  worker.on("exit", (code) => {
    if (code !== 0) {
      console.error(`Worker stopped with exit code ${code}`);
    }
  });
});

// This route will create multiple worker threads and
// will not block the event loop and will allow
// other requests to be processed
const createWorker = () => {
  // return a promise which will resolve the result
  return new Promise((resolve, reject) => {
    // Create a new worker thread
    const worker = new Worker("./worker-custom-threads.js", {
      workerData: { thread_count: THREAD_COUNT },
    });

    // it will listen to the message event from the worker thread
    worker.on("message", (data) => {
      resolve(data);
    });

    // it will listen to the error event from the worker thread
    worker.on("error", (err) => {
      reject(err);
    });

    // it will listen to the exit event from the worker thread
    worker.on("exit", (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
      }
    });
  });
};

// This route will create multiple worker threads and
// will not block the event loop and will allow
app.get("/non-blocking-custom-threads", async (req, res) => {
  try {
    // To store Promises from all threads
    const workerPromises = [];

    // Create multiple worker threads
    for (let i = 0; i < THREAD_COUNT; i++) {
      workerPromises.push(createWorker());
    }

    // Wait for all threads to complete
    const threadResult = await Promise.all(workerPromises);

    // Calculate the result from all threads
    const result = threadResult.reduce((acc, val) => acc + val, 0);

    // Send the result to the client
    return res.status(200).send(`Result is ${result}`);
  } catch (error) {
    // Handle the error if any
    console.error("Error in non-blocking-custom-threads:", error);
    return res.status(500).send(`Error Occurred: ${error.message}`);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
