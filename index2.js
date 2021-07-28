const fs = require("fs");
const axios = require("axios");
const unzipper = require("unzipper");

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
    await fs
      .createReadStream(output)
      .pipe(unzipper.Extract({ path: "data/" + filename }));
    const file = fs.readFileSync(`data/${filename}/2D_Base.kml`, "utf8");
    console.log(typeof file);
  } catch (error) {
    console.log("error =>", error);
  }
}
a();
