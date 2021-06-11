const axios = require('axios')
const MongoClient = require('mongodb').MongoClient;
const mongoParams = { useNewUrlParser: true, useUnifiedTopology: true };
const url = 'mongodb://127.0.0.1:27017/';
const api_rain = 'http://api2.thaiwater.net:9200/api/v1/thaiwater30/public/rain_24h';
const api_water = 'http://api2.thaiwater.net:9200/api/v1/thaiwater30/public/waterlevel_load';

let client = new MongoClient(url, mongoParams);

client.connect(async err => {
  if (err) {
    console.log(err.message);
    throw new Error("failed to connect");
  }

  let datab = client.db("rtfloodbma");
  console.log("db connected");

  try {
    await axios.get(api_rain).then(res => {
      try {
        datab.collection("rain").insertOne(res.data);
        console.log("insert succeeded");
      } catch (err) {
        console.log("insert failed");
        console.log(err.message);
      }
    });
  } catch (err) {
    throw Error("axios get did not work");
  }
});

client.connect(async err => {
  if (err) {
    console.log(err.message);
    throw new Error("failed to connect");
  }

  let datab = client.db("rtfloodbma");
  console.log("db connected");

  try {
    await axios.get(api_water).then(res => {
      try {
        datab.collection("water").insertOne(res.data);
        console.log("insert succeeded");
      } catch (err) {
        console.log("insert failed");
        console.log(err.message);
      }
    });
  } catch (err) {
    throw Error("axios get did not work");
  }
});

