const axios = require("axios");

const baseUrl = "http://jservice.io/api/";

export async function getCluesData() {
  const { data } = axios.get(`${baseUrl}`);

  return;
}
