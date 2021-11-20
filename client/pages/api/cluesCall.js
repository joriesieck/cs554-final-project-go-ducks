const axios = require("axios");

const baseUrl = "http://jservice.io/api/";

export default async function handler(req, res) {
  try {
    const params = req.params;

    let clues = params.clues;

    const { data } = await axios.get(`${baseUrl}/`);
  } catch (e) {
    console.log(e);
  }
}
