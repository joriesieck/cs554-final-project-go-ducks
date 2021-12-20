const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const app = express();
const configRoutes = require('./routes');
// const serviceAccount = require('./cs554-go-ducks-firebase-adminsdk-vfm00-b40f1c37d3.json');
const getUserRoute = '/users/username';
const getAllUsers = '/users';
// following firebase documentation and https://dev.to/dingran/next-js-firebase-authentication-and-middleware-for-api-routes-29m1
const serviceAccount = {
  "type": process.env.type,
  "project_id": process.env.project_id,
  "private_key_id": process.env.private_key_id,
  "private_key": process.env.private_key,
  "client_email": process.env.client_email,
  "client_id": process.env.client_id,
  "auth_uri": process.env.auth_uri,
  "token_uri": process.env.token_uri,
  "auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url,
  "client_x509_cert_url": process.env.client_x509_cert_url
}

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
