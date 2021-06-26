const data = require('./o2s6uc.json');
const fs = require('fs');

let doc = data.kml.Document;

function data_center_of_map() {
  const center_of_map = doc[0].LookAt.map(doc_item => {
    let param_doc = [];
    param_doc = doc_item;
    return param_doc
  })
  return center_of_map
}

function data_polygons() {
  const polygons = doc[0].Folder[4].Placemark.map(blue_item => {
    let param_blue = [];
    param_blue = blue_item;

    let str = param_blue.MultiGeometry[0].Polygon[0].outerBoundaryIs[0].LinearRing[0].coordinates[0].toString();
    let datas_str = str.split("\r\n");
    let result_datas = datas_str.filter(data_str => data_str !== undefined && data_str !== '');

    let res_datas = result_datas.map(item => {
      let temp = item.trim().split(",")
      let res_poly = {
        "name": param_blue.name[0],
        "coordinates": [
          {
            "longitude": temp[0],
            "latitude": temp[1],
          }
        ]
      }
      return res_poly
    })
    return res_datas
  })
  return polygons
}

function data_boundary() {
  const boundary = doc[0].Folder[6].Placemark.map(blue_item => {
    let param_blue = [];
    param_blue = blue_item;

    let str = param_blue.MultiGeometry[0].LineString[0].coordinates[0].toString();
    let datas_str = str.split("\r\n");
    let result_datas = datas_str.filter(data_str => data_str !== undefined && data_str !== '');

    let res_datas = result_datas.map(item => {
      let temp = item.trim().split(",")
      return {
        "longitude": temp[0],
        "latitude": temp[1],
      }
    })
    return res_datas
  })
  return boundary
}

function json() {
  const data_center = data_center_of_map();
  const data_bon = data_boundary();
  const data_poly = data_polygons();

  const center = { latitude: data_center[0].latitude[0], longitude: data_center[0].longitude[0] }
  const boundary = data_bon
  const input = { rains: {}, waters: {}, dem: {} }
  const myObj = { input, center_of_map: center, polygons: data_poly, boundary };

  return myObj

}
const jsons = json();

// for (let item of Object.keys(jsons)) {
//   var capital = jsons[item];
//   console.log(item, capital);
// }

const writeFile = () => {
  let random = Math.random().toString(36).substring(7);
  const json = JSON.stringify(jsons, null, 2);
  fs.writeFileSync('json/' + random + "_new" + '.json', json);
}
writeFile();


