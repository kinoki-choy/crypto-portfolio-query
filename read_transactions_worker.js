const fs = require("fs");
const { parse } = require("csv-parse");
const { parentPort } = require("worker_threads");

const transactions = {};
fs.createReadStream("statement.csv")
  .pipe(parse({ columns: true }))
  .on("data", function (data) {
    if (!(data.token in transactions)) {
      transactions[data.token] = [];
    }
    transactions[data.token].push({
      timestamp: parseInt(data.timestamp),
      transaction_type: data.transaction_type,
      amount: parseFloat(data.amount),
    });
  })
  .on("end", function (data) {
    parentPort.postMessage(transactions);
  })
  .on("error", function (error) {
    console.log(error.message);
  });
