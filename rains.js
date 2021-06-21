const axios = require('axios')
const fs = require('fs');
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/rtfloodbma?readPreference=primary&appname=MongoDB%20Compass&ssl=false', { useNewUrlParser: true, useUnifiedTopology: true });

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', async () => {
  console.log("Connection Successful!");

  // define Schema
  const RainSchema = mongoose.model('rains', new mongoose.Schema({
    id: String,
    rain_24h: String,
    rainfall_datetime: String,
    station_type: String,
    agency: {
      agency_name: {
        th: String,
        en: String,
        jp: String,
      },
      agency_shortname: {
        th: String,
        en: String,
        jp: String,
      }
    },
    geocode: {
      warning_zone: String,
      area_code: String,
      area_name: {
        th: String
      },
      amphoe_name: {
        th: String
      },
      tumbon_name: {
        th: String
      },
      province_code: String,
      province_name: {
        th: String
      }
    },
    station: {
      id: String,
      tele_station_name: {
        th: String
      },
      tele_station_lat: String,
      tele_station_long: String,
      tele_station_oldcode: String,
      tele_station_type: String,
      sub_basin_id: String
    },
    basin: {
      id: String,
      basin_code: String,
      basin_name: {
        th: String,
        en: String
      }
    },
    _id: String
  }));

  const getDataRain = async () => {
    try {
      //response
      const req = axios.get('http://api2.thaiwater.net:9200/api/v1/thaiwater30/public/rain_24h');
      const res = await req;
      const datas = res.data.data;
      //filter
      let data = datas.filter(data => data.geocode.amphoe_name.th === 'ทุ่งสง');
      //gen _id object
      for (let item of data) {
        item._id = `${item.id}_${item.station.id}`;
      }
      // data filter + gen_id object
      return data;
    } catch (error) {
      console.log(error)
    }
  }

  // documents array
  let dataRain = await getDataRain()

  for (let item of dataRain) {
    // console.log("data => ",item)
    const res = await RainSchema.updateOne({ _id: item._id }, item, { upsert: true });
    // console.log(res.n);
    // console.log(res.nModified);
    res.n;
    res.nModified;
  }

  const writeFiles = async () => {
    const random = Math.random().toString(36).substring(7);
    const json = await JSON.stringify(dataRain, null, 2);
    fs.writeFileSync('json_rain/' + random + '_new' + '.json', json);
    console.log("writeFiles");
  }
  writeFiles();

});