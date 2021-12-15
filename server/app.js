const express = require('express');
const cors = require('cors');
const app = express();
const configRoutes = require('./routes');

app.use(cors());
app.use(express.json());

// authentication middleware
app.use(async (req, res, next) => {
  console.log(req.body);
  next();
})

configRoutes(app);

app.listen(3001, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3001');
});
