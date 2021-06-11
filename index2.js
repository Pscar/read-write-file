const data = require('./json/cqahml.json');
const fs = require('fs');

const fs = require('fs');
const xml2js = require('xml2js');
const xml = fs.readFileSync('2D_Base.kml');

xml2js.parseString(xml, { mergeAttrs: true }, (err, result) => {
  if (err) {
    throw err;
  }

  let element = {
    center_of_map: [],
    blue_polygons: [],
    boundary: []
  }

  let random = Math.random().toString(36).substring(7);
  array ที่สนใจ
  let myObj = {
    center_of_map: [],
    blue_polygons: [],
    boundary: []
  }

  // map mok data
  const Document = data.kml.Document.map(doc_item => {
    let param_doc = [];
    param_doc = doc_item;
    return param_doc
  })
  const Folder = data.kml.Document[0].Folder.map(blue_item => {
    let param_blue = [];
    param_blue = blue_item;
    return param_blue;
  })

  // add new data to array ที่สนใจ
  myObj.center_of_map.push({ LookAt: Document[0].LookAt })
  myObj.blue_polygons.push({ name: Folder[4].name }, { Style: Folder[4].Style }, { Placemark: Folder[4].Placemark })
  myObj.boundary.push({ name: Folder[6].name }, { Style: Folder[6].name }, { Placemark: Folder[6].name })

  // เขียนใส่ file json
  const json = JSON.stringify(myObj, null, 2);
  fs.writeFileSync('json/' + random + "_new" + '.json', json);

});

