const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const app = express();
const configRoutes = require('./routes');
const serviceAccount = require('./cs554-go-ducks-firebase-adminsdk-vfm00-b40f1c37d3.json');
const getUserRoute = '/users/username';
const getAllUsers = '/users';
// following firebase documentation and https://dev.to/dingran/next-js-firebase-authentication-and-middleware-for-api-routes-29m1

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(cors());
app.use(express.json());

// authentication middleware
app.use(async (req, res, next) => {
  try {
    if (req.url.includes(getUserRoute) || getAllUsers === req.url) {
      next();
      return;
    }
    const result = await admin.auth().verifyIdToken(req.headers.authtoken);
  } catch (e) {
    res
      .status(403)
      .json({ error: 'You must be logged in to access this route.' });
    return;
  }
  next();
});

configRoutes(app);

app.listen(3001, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3001');
});
