const fs = require("fs");
const axios = require("axios");
const moment = require("moment");
const { parse } = require("csv-parse");
const { argv } = require("./yargs.js");
const config = require("./config.js");

const readTransactions = async (filename) => {
  console.log("Reading transactions...");
  return new Promise((resolve, reject) => {
    const transactions = {};
    fs.createReadStream(filename)
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
      .on("end", function () {
        resolve(transactions);
      })
      .on("error", function (error) {
        console.log(error.message);
      });
  });
};

const getExchangeRate = async (token) => {
  const response = await axios.get(
    `${config.cryptocompare.base_url}&fsym=${token}&tsyms=${config.base_currency}&api_key=${config.cryptocompare.api_key}`
  );
  return response.data[config.base_currency];
};

const getPortfolioValue = async ({ transactions, token, date }) => {
  let balance = 0;
  for (const transaction of transactions[token]) {
    if (date && transaction.timestamp > date) {
      continue;
    }
    if (transaction.transaction_type === "DEPOSIT") {
      balance += transaction.amount;
    } else if (transaction.transaction_type === "WITHDRAWAL") {
      balance -= transaction.amount;
    }
  }
  const exchangeRate = await getExchangeRate(token);
  return (balance * exchangeRate).toFixed(2);
};

const displayPortfolioValue = (token, portfolio_value) => {
  console.log(
    `${token.toUpperCase()}: ${config.base_currency}${portfolio_value}`
  );
};

(async () => {
  const transactions = await readTransactions(config.csv_file);
  const tokens = Object.keys(transactions);

  // Given no parameters, return the latest portfolio value per token in USD
  if (!argv.token && !argv.date) {
    for (let token of tokens) {
      const portfolioValue = await getPortfolioValue({
        transactions: transactions,
        token: token,
      });
      displayPortfolioValue(token, portfolioValue);
    }
  }

  // Given a token, return the latest portfolio value for that token in USD
  if (!("date" in argv) && argv.token) {
    const portfolioValue = await getPortfolioValue({
      transactions: transactions,
      token: argv.token.toUpperCase(),
    });
    displayPortfolioValue(argv.token, portfolioValue);
  }

  // Given a date, return the portfolio value per token in USD on that date
  if (!("token" in argv) && argv.date) {
    for (let token of tokens) {
      const portfolioValue = await getPortfolioValue({
        transactions: transactions,
        token: token,
        date: moment(`${argv.date} 24:00`).unix(),
      });
      displayPortfolioValue(token, portfolioValue);
    }
  }

  // Given a date and a token, return the portfolio value of that token in USD on that date
  if (argv.token && argv.date) {
    const portfolioValue = await getPortfolioValue({
      transactions: transactions,
      token: argv.token.toUpperCase(),
      date: moment(`${argv.date} 24:00`).unix(),
    });
    displayPortfolioValue(argv.token, portfolioValue);
  }
})();
