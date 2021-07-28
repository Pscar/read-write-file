const { Sequelize, QueryTypes } = require("sequelize");
const fs = require("fs");
const axios = require("axios");
const unzipper = require("unzipper");
const config = require("./config");
const xml2js = require("xml2js");
const walk = require("walk");
const { r } = require("tar");

// const dotenv = require('dotenv');
// dotenv.config();

const sequelize = new Sequelize(
  `mysql://${config.db.user}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.database}`
);
const getWeather = async () => {
  // query for weather
  const weathers = await sequelize.query("SELECT kmls FROM `weathers`", {
    type: QueryTypes.SELECT,
  });
  // map weathers to kmls
  const kmls = await weathers.map((item) => item.kmls);
  // loop array kmls in database
  for await (const data of kmls) {
    // string kmls to array
    const url = `https://weather.ckartisan.com/storage/${data}`;
    // random name for zip file
    let random = Math.random().toString(36).substring(7);
    // output location file .zip
    const randomNameZip = `${random}.zip`;
    const output = `kmls/${randomNameZip}`;
    try {
      // get response from url to axios type array buffer
      const response = await axios.get(url, { responseType: "arraybuffer" });
      // write file to output location .zip
      await fs.writeFileSync(output, response.data, (err) => {
        if (err) throw err;
        console.log("The file has been saved!");
      });
      // unzip file to kmls folder
      // const writer = unzipper.Extract({ path: `data/${randomNameZip}` });
      // reader.on("end", () => {
      //   readFile(randomNameZip);
      // });
      
      const reader = await fs.createReadStream(output);
      reader.pipe(unzipper.Extract({ path: `data/${randomNameZip}` }));

      const walker = walk.walk(`./data`, { followLinks: false });
      const files = [];
      walker.on("file", function (root, stat, next) {
        files.push(`${stat.name}`);
        next();
      });

      walker.on("end", function () {
        const xml = files.filter((file) => file === "2D_Base.kml");
        xml2js.parseString(xml, { mergeAttrs: true }, (err, result) => {
          if (err) {
            throw err;
          }
          let random = Math.random().toString(36).substring(7);
          const json = JSON.stringify(result, null, 2);
          fs.writeFileSync("json/" + random + "_new" + ".json", json);
        });
      });
    } catch (error) {
      console.log("error =>", error);
    }
    break;
  }
};

// const readFile = (randomNameZip) => {
//   const xml = fs.readFileSync(`data/${randomNameZip}/2D_Base.kml`);
//   xml2js.parseString(xml, { mergeAttrs: true }, (err, result) => {
//     if (err) {
//       throw err;
//     } else {
//       console.log(result);
//     }
//   });
// };

// const file = fs.readFileSync(`data/${output}/2D_Base.kml`, "utf8");
// console.log(file);
// const readFile = () => {
//   const file = fs.readFileSync(`data/${output}/2D_Base.kml`, "utf8");
//   console.log(file);
//   const json = JSON.stringify(file, null, 2);
//   fs.writeFileSync("json/" + random + "_new" + ".json", json);
// };
// read file in folder from 2D_Base.kml data/output/2D_Base.kml
// const file = fs.readFileSync(`data/${output}/2D_Base.kml`, "utf8");
// console.log(file);
// fs.readdirSync(fileKmls).forEach((file) => {
//   console.log(file);
//   const json = JSON.stringify(file, null, 2);
//   fs.writeFileSync("json/" + random + "_new" + ".json", json);
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

getWeather();
