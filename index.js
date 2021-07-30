const { Sequelize, QueryTypes } = require("sequelize");
const fs = require("fs");
const axios = require("axios");
const unzipper = require("unzipper");
const config = require("./config");
const xml2js = require("xml2js");

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
  console.log("length", kmls.length);
  let number = 0;
  for await (const data of kmls) {
    // string kmls to array
    const url = `https://weather.ckartisan.com/storage/${data}`;
    console.log("url", url);
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
      // // unzip file to kmls folder
      await unZip(output, randomNameZip, number);

      number += 1;
      // read file kmls
      const xml = await fs.readFileSync(
        `data/${number}_${randomNameZip}/2D_Base.kml`,
        "utf8"
      );
      await writeJson(xml, randomNameZip, number);
    } catch (error) {
      console.log("error =>", error);
    }
    // break;
  }
};

const unZip = async (output, randomNameZip, number) => {
  return new Promise((resolve, reject) => {
    number += 1;
    const reader = fs.createReadStream(output);
    reader
      .pipe(unzipper.Extract({ path: `data/${number}_${randomNameZip}` }))
      .on("error", reject)
      .on("finish", resolve);
  });
};

const writeJson = async (xml, randomNameZip, number) => {
  xml2js.parseString(xml, { mergeAttrs: true }, (err, result) => {
    if (err) {
      throw err;
    } else {
      const data_center_of_map = () => {
        const center_of_map = result.kml.Document[0].LookAt.map((doc_item) => {
          let param_doc = [];
          param_doc = doc_item;
          return param_doc;
        });
        return center_of_map;
      };
      const data_polygons = () => {
        // console.log(result.kml.Document[0].Folder[4].Placemark);
        const polygons = result.kml.Document[0].Folder[4].Placemark.map(
          (blue_item) => {
            let param_blue = [];
            param_blue = blue_item;

            let str =
              param_blue.MultiGeometry[0].Polygon[0].outerBoundaryIs[0].LinearRing[0].coordinates[0].toString();
            let datas_str = str.split("\r\n");
            let result_datas = datas_str.filter(
              (data_str) => data_str !== undefined && data_str !== ""
            );

            let res_datas = result_datas.map((item) => {
              let temp = item.trim().split(",");
              //return temp;
              return {
                longitude: temp[0],
                latitude: temp[1],
              };
            });
            //return res_datas;
            return {
              name: param_blue.name[0],
              coordinates: res_datas,
            };
          }
        );
        return polygons;
      };
      const data_boundary = () => {
        let str =
          result.kml.Document[0].Folder[6].Placemark[0].MultiGeometry[0].LineString[0].coordinates[0].toString();
        let datas_str = str.split("\r\n");
        let result_datas = datas_str.filter(
          (data_str) => data_str !== undefined && data_str !== ""
        );

        let res_datas = result_datas.map((item) => {
          let temp = item.trim().split(",");
          return {
            longitude: temp[0],
            latitude: temp[1],
          };
        });
        return {
          coordinates: res_datas,
        };
      };
      const data_Json = () => {
        const data_center = data_center_of_map();
        const data_bon = data_boundary();
        const data_poly = data_polygons();

        const input = { rains: {}, waters: {}, dem: {} };
        const center = {
          latitude: data_center[0].latitude[0],
          longitude: data_center[0].longitude[0],
        };

        const myObj = [
          {
            input: input,
            center_of_map: center,
            polygons: data_poly,
            boundary: data_bon,
          },
        ];
        // const myObj = {
        //   input: input,
        //   center_of_map: center,
        //   polygons: data_poly,
        //   boundary: data_bon,
        // };

        return myObj;
      };
      const jsons = data_Json();

      const writeFile = () => {
        for (const fileJson of jsons) {
          const json = JSON.stringify(fileJson,null,2);
          fs.writeFileSync("json/" + `${number}_${randomNameZip}` + ".json", json);
        }
      };
      writeFile();
    }
  });
};

getWeather();
