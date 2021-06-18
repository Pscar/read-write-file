const axios = require('axios')
const fs = require('fs');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/rtfloodbma', { useNewUrlParser: true, useUnifiedTopology: true });

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', async () => {
  console.log("Connection Successful!");

  const WaterSchema = mongoose.model('water', new mongoose.Schema({
    waterlevel_data: {
      id: String,
      waterlevel_datetime: String,
      waterlevel_m: String,
      waterlevel_msl: String,
      flow_rate: String,
      discharge: String,
      storage_percent: String,
      sort_order: String,
      station_type: String,
      situation_level: String,
    },
    agency: {
      id: String,
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
    basin: {
      id: String,
      basin_code: String,
      basin_name: {
        th: String,
        en: String,
      }
    },
    station: {
      id: String,
      tele_station_name: {
        th: String,
        en: String,
      },
      tele_station_lat: String,
      tele_station_long: String,
      tele_station_oldcode: String,
      tele_station_type: String,
      left_bank: String,
      right_bank: String,
      min_bank: String,
      ground_level: String,
      offset: String,
      sub_basin_id: String,
      agency_id: String,
      geocode_id: String,
      is_key_station: false,
      warning_level_m: String,
      critical_level_m: String,
      critical_level_msl: String
    },
    geocode: {
      area_code: String,
      area_name: {
        th: String,
      },
      amphoe_code: String,
      amphoe_name: {
        th: String,
      },
      tumbon_code: String,
      tumbon_name: {
        th: String,
      },
      province_code: String,
      province_name: {
        th: String,
      }
    },
    _id: String
  }));
  
  const getDataWater = async () => {
    try {
      //response
      const req = axios.get('http://api2.thaiwater.net:9200/api/v1/thaiwater30/public/waterlevel_load');
      const res = await req;
      const datas = res.data.waterlevel_data.data;

      let data = datas.filter(data => data.station.tele_station_name.th === 'ทุ่งสง');

      for (let item of data) {
        item._id = `${item.id}_${item.station.id}`;
      }

      return data;

    } catch (error) {
      console.log(error)
    }
  }

  let dataWater = await getDataWater()

  for (let item of dataWater) {
    console.log("data => ",item)
    const res = await WaterSchema.updateOne({ _id: item._id }, item, { upsert: true });
    // console.log(res.n);
    // console.log(res.nModified);
    res.n;
    res.nModified;
  }
  
  const writeFiles = async () => {
    const random = Math.random().toString(36).substring(7);
    const json = await JSON.stringify(dataWater, null, 2);
    fs.writeFileSync('json_water/' + random + '_new' + '.json', json);

    console.log('writeFile');
  }
  writeFiles();

});