## Cryptocurrency portfolio command line program

As the transactions made over a period of time is logged in a CSV file, the file size grows accordingly.
For handling the large csv file(~980mb, 30 million rows), Node.js streams is used for parsing before transforming them into a Hashmap with transactions grouped by token key.

```
{
  BTC: [
    {
      timestamp: 1571967208,
      transaction_type: 'DEPOSIT',
      amount: 0.29866
    }
  ],
  ETH: [
    {
      timestamp: 1571967200,
      transaction_type: 'DEPOSIT',
      amount: 0.68364
    },
  ],
  XRP: [
    {
      timestamp: 1571967150,
      transaction_type: 'DEPOSIT',
      amount: 0.693272
    }
  ]
}
```

Using Promises `const transactions` can be cached until the program exits.
This helps with unnecessary parsing of CSV file. The initial idea was to deal with the data abeit like the ETL(extract, transform, load) approach but did not go with it as I wanted to avoid the overhead of database. Instead, I thought with a Hashmap data structure, lookups can be faster.

As of now, running this program `node --max-old-space-size=4096 index.js` without any parameters takes about 3 minutes, based on 1.4 GHz Dual-Core Intel Core i5 and 4 GB 1600 MHz DDR3.

Moving forward, when the augmentation of data gets more complicated, it would be wise to look into DataFrame(for e.g Pandas or equivalent in Node.js implementation).

# API key for exchange rates
The API key for fetching exchange rates can be obtained via [CryptoCompare](https://min-api.cryptocompare.com/).

# To use
The command line program accepts arguments.

```
index.js                                Return overall portfolio value
index.js --token BTC                    Return portfolio value based on token
index.js --date 2014-02-12              Return overall portfolio value based on date
index.js --token BTC --date 2014-02-12  Return portfolio based on token and date
```
