const fs = require('fs');
const xml2js = require('xml2js');

const xml = fs.readFileSync('2D_Base.kml');

xml2js.parseString(xml, { mergeAttrs: true }, (err, result) => {
  if (err) {
    throw err;
  }
  let random = Math.random().toString(36).substring(7);
  const json = JSON.stringify(result, null, 2);
  fs.writeFileSync('json/' + random + '.json', json);
  
});

