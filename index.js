const axios = require('axios')
const MongoClient = require('mongodb').MongoClient;

const mongoParams = { useNewUrlParser: true, useUnifiedTopology: true }; 
const url_db = 'mongodb://127.0.0.1:27017/';
const client = new MongoClient(url_db, mongoParams);

const api_rain = 'http://api2.thaiwater.net:9200/api/v1/thaiwater30/public/rain_24h';
const api_water = 'http://api2.thaiwater.net:9200/api/v1/thaiwater30/public/waterlevel_load';

client.connect(async err => {

  // ตรวจสอบ error connect db 
  if (err) {
    console.log(err.message);
    throw new Error("failed to connect");
  }
  //connect db
  let datab = client.db("rtfloodbma");
  console.log("db connected");

  // get data axios 
  try {
    await axios.get(api_rain).then(res => {
      try {
        datab.collection("rain").insertOne(res.data);
        console.log("insert succeeded");
      } catch (err) {
        console.log("insert failed", err.message);
      }
    });
  } catch (err) {
    throw Error("axios get did not work");
  }
  // get data axios 
  try {
    await axios.get(api_water).then(res => {
      try {
        datab.collection("water").insertOne(res.data);
        console.log("insert succeeded");
      } catch (err) {
        console.log("insert failed", err.message);
      }
    });
  } catch (err) {
    throw Error("axios get did not work");
  }

});



