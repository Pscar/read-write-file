const axios = require('axios')
const fs = require('fs');


const get_rain = async () => {
  try {
    //response
    const response = axios.get('http://www.rtfloodbma.com/api/fetch_rains');
    const request = await response;
    const data = request.data;

    return data;

  } catch (error) {
    console.log(error)
  }
}

/*const writeFile = async () => {
  let get_rains = await get_rain();
  const random = Math.random().toString(36).substring(7);
  const json = await JSON.stringify(get_rains, null, 2);
  fs.writeFileSync('json_rain/' + random + '_new' + '.json', json);
  console.log('writeFile');
}

writeFile();*/
