import cluster from "cluster";
import os from "os";
import { dirname } from "path";
import { fileURLToPath } from "url";

// Get the directory path
const __dirname = dirname(fileURLToPath(import.meta.url));
// Get the number of logical CPU cores
const CPU_COUNT = os.cpus().length;

console.log(`Total Number of CPUs: ${CPU_COUNT}`);
console.log(`Primary pid=${process.pid}`);

// Setup the primary cluster
cluster.setupPrimary({
  exec: __dirname + "/cluster.js",
});

// spawn a new worker process for each CPU core
for (let i = 0; i < CPU_COUNT; i++) {
  cluster.fork();
}

// if a worker dies, spawn another worker
cluster.on("exit", (worker, code, signal) => {
  console.log(
    `Worker ${worker.process.pid} died, code=${code}, signal=${signal}`
  );
  console.log(`Starting Another Worker...`);
  cluster.fork();
});
