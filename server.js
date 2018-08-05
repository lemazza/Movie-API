const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {Movie, Clue} = require('./models');
const config = require('./config');


const { DATABASE_URL, PORT } = require('./config');


const app = express();
var http = require('http').Server(app);
app.use(morgan('common'));
app.use(bodyParser.json());



app.get('/', function (req, res, next) {
  res.send('Hellloooo from Movie Game API server');
});


function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = http.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}


function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}


if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}


module.exports = { runServer, app, closeServer };