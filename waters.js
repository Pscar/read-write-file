const axios = require('axios')
const fs = require('fs');

const get_water = async () => {
  try {
    //response
    const response = axios.get('http://www.rtfloodbma.com/api/fetch_waters');
    const request = await response;
    const data = request.data;
    return data;

  } catch (error) {
    console.log(error)
  }
}

/*const writeFile = async () => {
  let get_waters = await get_water();
  const random = Math.random().toString(36).substring(7);
  const json = await JSON.stringify(get_waters, null, 2);
  fs.writeFileSync('json_water/' + random + '_new' + '.json', json);
  console.log('writeFile');
}
writeFile();*/