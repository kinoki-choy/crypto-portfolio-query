const argv = require("yargs")
  .usage("Usage: $0 <command> [options]")
  .example("$0", "Return overall portfolio value")
  .example("$0 --token BTC", "Return portfolio value based on token")
  .example(
    "$0 --date 2014-02-12",
    "Return overall portfolio value based on date"
  )
  .example(
    "$0 --token BTC --date 2014-02-12",
    "Return portfolio based on token and date"
  )
  .alias("t", "token")
  .describe("t", "Specify a token")
  .alias("d", "date")
  .describe("d", "Specify a date(YYYY-MM-DD)")
  .help("h")
  .alias("h", "help").argv;

module.exports = {
  argv: argv,
};
