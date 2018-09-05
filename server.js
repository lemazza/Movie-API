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
/*
 *
 * MOVIES
 *
 */

 //deliver random movie
app.get('/movies/random', (req, res) => {
  let totalResults, randomNum;
  Movie
  .find({})
  .then(movies => {
    totalResults = Object.keys(movies).length;
    randomNum = Math.floor(Math.random() * totalResults);
    return movies[randomNum];
  })
  .then(movie => {
    res.json(movie.serialize())
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong with the randomizer, this has to be our fault', status: err });
  });
})

app.get('/movies/:id', (req, res)=> {
  Movie
  .findById(req.params.id)
  .then(movie => {
    res.status(200).json(movie.serialize());
  })
  .catch(err => {
    res.status(500).json({error: 'something went wrong on get', status: err })
  })
})



app.get('movies/title/:title', (req, res)=>{
  conole.log(req.params.title);
  Movie
  .findOne({title: req.params.title})
  .then(movie => {
    res.status(200).json(movie.serialize());
  })
  .catch(err => {
    res.status(500).json({error: 'something went wrong on get', status: err })
  })
})

app.put('/movies/:id', (req, res) => {
  const {guess} = req.body

  Movie
  .findByIdAndUpdate(
    req.params.id,

  )
})

app.post('/movies', (req, res) => {
  //check to make sure the required fields are in the body
  const requiredFields = ['title', 'year', 'guesses'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    } 
  }

  let {title, year, guesses} = req.body;
  Movie
  .create({
    title,
    year,
    guesses
  })
  .then(movie => {
    res.status(201).json(movie.serialize())
  })
  .catch(err => {
    res.status(500).json({error: 'problem creating movie', status: err})
  })
})

/*
 *
 * CLUES
 *
 */

//deliver random guess word
app.get('/clue/random', (req, res) => {
  let totalResults, randomNum;
  Clue
  .find({})
  .then(clues => {
    totalResults = Object.keys(clues).length;
    randomNum = Math.floor(Math.random() * totalResults);
    return clues[randomNum];
  })
  .then(clue => {
    res.json(clue)
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong with the randomizer, this has to be our fault', status: err });
  });
})

//retrieve guess word
app.get('/clue/:guessWord', (req, res) =>{
  //need to perform some regex on guessword - no spaces, numbers, symbols, convert to all lowercase

  Clue
  .find({word: req.params.guessWord})
  .then(clue => {
    res.status(200).json(clue)
  })
  .catch(err => {
    res.status(500).json({error: 'could not retrieve word', status: err})
  })
})



//post guess word
// never going to happen by itself.  will need to update/create new when associated with a movie



//update guessword with movie(and update movie with guess word)
app.get('/clue/:guessWord', (req, res)=> {
  const {movieTitle} = req.body;
  const {guessWord} = req.params;
  Clue
  .findOneAndUpdate(
    {word: guessWord, "guesses.movie.title": movieTitle},
    {$inc: {"guesses.$.count": 1}},
    {upsert: true}

    //if guess exists increment, if not add to array with count=1
  )
  .then(clue => {
    Movie
    .findOneAndUpdate(
      {title: movieTitle, "guesses.clueWord": guessWord},
      {$inc: {"guesses.$.count": 1}},
      {upsert: true}
    )
    .then(movie => {
      res.status(200).json({clue, movie});
    }) 
  })
  .catch(err=> {
    res.status(500).json({error: 'this is going to fuck up for a bit', status: err})
  })
})






 /*
 *
 * RUNSERVER
 *
 */

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