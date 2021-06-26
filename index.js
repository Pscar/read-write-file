const data = require('./o2s6uc.json');
const MongoClient = require('mongodb').MongoClient;
const mongoParams = { useNewUrlParser: true, useUnifiedTopology: true };
const url_db = 'mongodb://127.0.0.1:27017/rtfloodbma?readPreference=primary&appname=MongoDB%20Compass&ssl=false';
const client = new MongoClient(url_db, mongoParams);
const fs = require('fs');

let doc = data.kml.Document;

const data_center_of_map = () => {
  for (let item of doc) {
    for (let long of item.LookAt) {
      for (item_long of long.longitude) {
        for (item_lat of long.latitude) {
          return {
            "longitude": item_long,
            "latitude": item_lat
          }
        }
      }
    }
  }
}

const data_polygon = () => {
  for (let item of doc) {
    for (let data of item.Folder) {
      if (data.Placemark) {
        for (let body of data.Placemark) {
          if (body.MultiGeometry) {
            for (let multigeometry of body.MultiGeometry) {
              if (multigeometry.Polygon) {
                for (let polygon of multigeometry.Polygon) {
                  if (polygon.outerBoundaryIs) {
                    for (let outerBoundaryIs of polygon.outerBoundaryIs) {
                      if (outerBoundaryIs.LinearRing) {
                        for (let LinearRing of outerBoundaryIs.LinearRing) {
                          if (LinearRing.coordinates) {
                            for (let coordinates of LinearRing.coordinates) {
                              if (coordinates) {
                                const body_name = () => {
                                  let names = body.name;
                                  let result_names = names.filter(data_name => data_name !== undefined && data_name !== '');
                                  let result_name = result_names.map(data_name => data_name);
                                  let res_name = result_name.toString();
                                  return res_name;
                                }
                                const name = body_name();
                                const data_coor = () => {
                                  let str = coordinates.toString();
                                  let datas_str = str.split("\r\n");
                                  let result_datas = datas_str.filter(data_str => data_str !== undefined && data_str !== '');
                                  let res_datas = result_datas.map(item => {
                                    let temp = item.trim().split(",")
                                    return {
                                      "name": name,
                                      "coordinate": [
                                        {
                                          "longitude": temp[0],
                                          "latitude": temp[1],
                                        }
                                      ]
                                    }
                                  })
                                  return res_datas
                                }
                                const res_coor = data_coor();
                                return res_coor
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

const data_boundary = () => {
  for (let item of doc) {
    for (let data of item.Folder) {
      if (data.Placemark) {
        for (let body of data.Placemark) {
          if (body.MultiGeometry) {
            for (let multigeometry of body.MultiGeometry) {
              if (multigeometry.Polygon) {
                for (let polygon of multigeometry.Polygon) {
                  if (polygon.outerBoundaryIs) {
                    for (let outerBoundaryIs of polygon.outerBoundaryIs) {
                      if (outerBoundaryIs.LinearRing) {
                        for (let LinearRing of outerBoundaryIs.LinearRing) {
                          if (LinearRing.coordinates) {
                            for (let coordinates of LinearRing.coordinates) {
                              if (coordinates) {
                                let str = coordinates.toString();
                                let datas_str = str.split("\r\n");
                                let result_datas = datas_str.filter(data_str => data_str !== undefined && data_str !== '');
                                let res_datas = result_datas.map(item => {
                                  let temp = item.trim().split(",")
                                  return {
                                    "longitude": temp[0],
                                    "latitude": temp[1],
                                  };
                                });
                                return res_datas
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
const jsons = () => {
  const myObj = {};

  const a = data_center_of_map();
  const b = data_polygon();
  const c = data_boundary();

  myObj.center_of_map = a
  myObj.polygons = b
  myObj.boundary = { coordinate: c }

  return myObj
}

const data_to_json = jsons();
client.connect(err => {

  if (err) {
    console.log(err.message);
    throw new Error("failed to connect");
  }

  let datab = client.db("rtfloodbma");
  console.log("db connected");

  const data_to_json = jsons();
  try {
    datab.collection("kml").insertMany([data_to_json], { ordered: false, });
    console.log("insert succeeded kml");
  } catch (err) {
    console.log("insert failed", err.message);
  }
});

const writeFile = () => {
  let random = Math.random().toString(36).substring(7);
  const json = JSON.stringify(data_to_json, null, 2);
  fs.writeFileSync('json/' + random + "_new" + '.json', json);
}
writeFile();