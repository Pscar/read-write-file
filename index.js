const axios = require('axios')
const fs = require('fs');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/rtfloodbma', { useNewUrlParser: true, useUnifiedTopology: true });

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', async () => {
  console.log("Connection Successful!");

  // define Schema
  var RainSchema = mongoose.Schema({
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
    }
  });

  // compile schema to model
  var Rain = mongoose.model('Rain', RainSchema, 'rain');

  //get data axios 
  const getDataRain = async () => {
    let param_axios = await axios.get('http://api2.thaiwater.net:9200/api/v1/thaiwater30/public/rain_24h')
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
  // documents array
  let param_getDataRain = await getDataRain()

  //save multiple documents to the collection referenced by Rain Model
  Rain.collection.insertMany(param_getDataRain, function (err, docs) {
    if (err) {
      return console.error(err);
    } else {
      console.log("Multiple documents inserted to Collection");
    }
  });

  const writeFiles = async () => {
    const random = Math.random().toString(36).substring(7);
    const json = await JSON.stringify(param_getDataRain, null, 2);
    fs.writeFileSync('json/' + random + "_new" + '.json', json);
  }
  writeFiles();
  
});