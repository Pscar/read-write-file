const fs = require("fs");
const axios = require("axios");
const unzipper = require("unzipper");
var walk = require("walk");
const xml2js = require('xml2js');
async function a() {
  let filename = "efg.zip";
  let output = "kmls/" + filename;
  let url =
    "https://weather.ckartisan.com/storage/uploads/fApRzB8BcRX2oZeNeUO5aaNG3REIb9pEz7di1R30.zip";
  try {
    // get response from url to axios type array buffer
    const response = await axios.get(url, { responseType: "arraybuffer" });
    // write file to output location .zip
    await fs.writeFileSync(output, response.data, (err) => {
      if (err) throw err;
      console.log("The file has been saved!");
    });
    // unzip file to kmls folder
    const reader = await fs.createReadStream(output);
    reader.pipe(unzipper.Extract({ path: `data/${filename}` }));
  } catch (error) {
    console.log("error =>", error);
  }
}

a();

var walker = walk.walk("./data", { followLinks: false });
var files = [];
walker.on("file", function (root, stat, next) {
  // Add this file to the list of files
  // console.log("=>",stat.name);
  files.push(stat.name);
  // console.log(files);
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
    fs.writeFileSync('json/' + random + "_new" + '.json', json);
  });
});
