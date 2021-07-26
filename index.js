const { Sequelize, QueryTypes } = require("sequelize");
const fs = require("fs");
const axios = require("axios");
const unzipper = require('unzipper');
const config = require("./config");

const sequelize = new Sequelize(
  `mysql://${config.db.user}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.database}`
);
const getWeather = async () => {
  const weathers = await sequelize.query("SELECT kmls FROM `weathers`", {
    type: QueryTypes.SELECT,
  });
  const kmls = weathers.map((item) => item.kmls);
  for (const data of kmls) {
    const url = `https://weather.ckartisan.com/storage/${data}`;
    let random = Math.random().toString(36).substring(7);
    const output = `kmls/${random}.zip`;
    try {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(output, response.data, (err) => {
        if (err) throw err;
        console.log("The file has been saved!");
      });
      fs.createReadStream(output).pipe(
        unzipper.Extract({ path: `data/${output}` })
      );
    } catch (error) {
      console.log(error);
    }
    break;
  }
};

getWeather();
// const con = mysql.createConnection({
//   host: config.db.host,
//   user: config.db.user,
//   password: config.db.password,
//   database: config.db.database,
// });

// con.connect(function (err) {
//   if (err) throw err;
//   con.query("SELECT kmls FROM weathers", function (err, result, fields) {
//     if (err) throw err;
//     for (const data of result) {
//       const url = `https://weather.ckartisan.com/storage/${data.kmls}`;
//       // let random = Math.random().toString(36).substring(7);
//       // const dir = __dirname + "/upload";
//       // fs.mkdirSync(dir);
//       // const output = ` ${random}.zip`;
//       // request({ url: url, encoding: null }, function (err, resp, body) {
//       //   if (err) throw err;
//       //   fs.writeFileSync(output, body, function (err) {
//       //     console.log("file written!");
//       //   });
//       // });
//     }
//   });
// });

// const data = require('./o2s6uc.json');
// const fs = require('fs');

// let doc = data.kml.Document;

// function data_center_of_map() {
//   const center_of_map = doc[0].LookAt.map(doc_item => {
//     let param_doc = [];
//     param_doc = doc_item;
//     return param_doc
//   })
//   return center_of_map
// }

// function data_polygons() {
//   const polygons = doc[0].Folder[4].Placemark.map(blue_item => {
//     let param_blue = [];
//     param_blue = blue_item;

//     let str = param_blue.MultiGeometry[0].Polygon[0].outerBoundaryIs[0].LinearRing[0].coordinates[0].toString();
//     let datas_str = str.split("\r\n");
//     let result_datas = datas_str.filter(data_str => data_str !== undefined && data_str !== '');

//     let res_datas = result_datas.map(item => {
//       let temp = item.trim().split(",")
//       //return temp;
//       return {
//         "longitude": temp[0],
//         "latitude": temp[1],
//       }
//     })
//     //return res_datas;
//     return {
//       "name": param_blue.name[0],
//       "coordinates": res_datas
//     }
//   })
//   return polygons
// }

// function data_boundary() {

//   let str = doc[0].Folder[6].Placemark[0].MultiGeometry[0].LineString[0].coordinates[0].toString();
//   let datas_str = str.split("\r\n");
//   let result_datas = datas_str.filter(data_str => data_str !== undefined && data_str !== '');

//   let res_datas = result_datas.map(item => {
//     let temp = item.trim().split(",")
//     return {
//       "longitude": temp[0],
//       "latitude": temp[1],
//     }
//   })
//   return {
//     "coordinates": res_datas
//   }

// }

// function json() {
//   const data_center = data_center_of_map();
//   const data_bon = data_boundary();
//   const data_poly = data_polygons();

//   const input = { rains: {}, waters: {}, dem: {} }
//   const center = { latitude: data_center[0].latitude[0], longitude: data_center[0].longitude[0] }

//   const myObj = {
//     input: input,
//     center_of_map: center,
//     polygons: data_poly,
//     boundary: data_bon
//   };

//   return myObj

// }
// const jsons = json();

// const writeFile = () => {
//   let random = Math.random().toString(36).substring(7);
//   const json = JSON.stringify(jsons, null, 2);
//   fs.writeFileSync('json/' + random + "_new" + '.json', json);
// }
// writeFile();
