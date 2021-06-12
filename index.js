const axios = require('axios')
const fs = require('fs');

const MongoClient = require('mongodb').MongoClient;
const mongoParams = { useNewUrlParser: true, useUnifiedTopology: true };
const url_db = 'mongodb://127.0.0.1:27017/';
const client = new MongoClient(url_db, mongoParams);

const api_rain = 'http://api2.thaiwater.net:9200/api/v1/thaiwater30/public/rain_24h';
const api_water = 'http://api2.thaiwater.net:9200/api/v1/thaiwater30/public/waterlevel_load';


client.connect(async err => {

  if (err) {
    console.log(err.message);
    throw new Error("failed to connect");
  }

  let datab = client.db("rtfloodbma");
  console.log("db connected");

  axios.get(api_rain)
    .then((response) => {

      const allRain = response.data.data;

      let datas = allRain.filter(data => data.geocode.amphoe_name.th === "ทุ่งสง");
      // console.log(datas);

      // for (let i = 0; i < allRain.length; i++) {
      //   if (allRain[i].geocode.amphoe_name.th === "ทุ่งสง") {
      //     datas.push(allRain[i]);
      //   }
      // }

      const random = Math.random().toString(36).substring(7);

      const json = JSON.stringify(datas, null, 2);
      fs.writeFileSync('json/' + random + "_new" + '.json', json);

      try {
        datab.collection("rain").insertOne({ datas });
        console.log("insert succeeded rain");
      } catch (err) {
        console.log("insert failed", err.message);
      }

    }).catch(error => console.log(error));

  try {
    await axios.get(api_water).then(res => {
      try {
        datab.collection("water").insertOne(res.data);
        console.log("insert succeeded water");
      } catch (err) {
        console.log("insert failed", err.message);
      }
    });
  } catch (err) {
    throw Error("axios get did not work");
  }

});



