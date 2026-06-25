const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function run() {
  try {
    const form = new FormData();
    form.append('pid','9999');
    form.append('pname','TestProductNode');
    form.append('ppprice','10');
    form.append('opprice','20');
    form.append('pcatgid','1');
    form.append('vid','1');
    form.append('status','Active');
    form.append('pdesc','Inserted via node test script');

    const postRes = await axios.post('http://localhost:9191/product/saveproduct', form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
    });

    console.log('POST response status:', postRes.status);
    console.log('POST response data:', postRes.data);

    const getRes = await axios.get('http://localhost:9191/product/showproduct');
    console.log('GET response status:', getRes.status);
    console.log('Number of products returned:', Array.isArray(getRes.data) ? getRes.data.length : 'N/A');
    if (Array.isArray(getRes.data)) {
      const found = getRes.data.find(p => p.pid === 9999 || p.pname === 'TestProductNode');
      console.log('Found newly created product:', !!found);
      if (found) console.log(found);
    } else {
      console.log(getRes.data);
    }
  } catch (err) {
    if (err.response) {
      console.error('Error status:', err.response.status);
      console.error('Error data:', err.response.data);
    } else {
      console.error(err.message);
    }
    process.exit(1);
  }
}

run();
