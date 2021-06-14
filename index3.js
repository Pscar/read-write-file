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

  const getDataRain = async () => {
    let param_axios = await axios.get(api_rain)
      .then((response) => {
        const allRain = response.data.data;
        let datas = allRain.filter(data => data.geocode.amphoe_name.th === "ทุ่งสง");
        for (let item of datas) {
          item._id = `${item.id}_${item.station.id}`;
        }
        return datas;
      }).catch(error => console.log(error));
    return param_axios;
  }

  let param_getDataRain = await getDataRain()

  // const writeFile = (param_getDataRain) => {
  //   console.log("🚀 ~ file: index3.js ~ line 40 ~ writeFile ~ param_getDataRain", param_getDataRain)
  //   const random = Math.random().toString(36).substring(7);
  //   const json = JSON.stringify(param_getDataRain, null, 2);
  //   fs.writeFileSync('json/' + random + "_new" + '.json', json);
  // }
  
  try {
    datab.collection("rain").insertMany(param_getDataRain, { ordered: false, });
    console.log("insert succeeded rain");
  } catch (err) {
    console.log("insert failed", err.message);
  }



  // try {
  //   await axios.get(api_water).then(res => {
  //     try {
  //       datab.collection("water").insertOne(res.data);
  //       console.log("insert succeeded water");
  //     } catch (err) {
  //       console.log("insert failed", err.message);
  //     }
  //   });
  // } catch (err) {
  //   throw Error("axios get did not work");
  // }

});



