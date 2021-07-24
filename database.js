const { createConnection } = require("mysql");

const database = createConnection({
  host: "weather.ckartisan.com",
  user: "weather",
  password: "weather",
  database: "weather",
});

database.query("SELECT kmls FROM weathers", (err, result, fields) => {
  if (err) {
    return console.log(err);
  }
  return console.log(result);
});

module.exports = database;
