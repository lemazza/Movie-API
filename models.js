'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const ObjectId = mongoose.Schema.Types.ObjectId;

/**
  * Movies
  */

const movieTitleSchema = mongoose.Schema({
  title: {type: String, required: true},
  year: {type: Number, required: true},
  guesses: [{
    clueWord: {type: String, required: true},
    count: {type: Number}
  }],
})

movieTitleSchema.methods.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    year: this.year,
    guesses: this.guesses,
  }
}

/**
  * Clues
  */

//need to POPULATE clues you want to return movie info from
//include that in serialize??

const clueSchema = mongoose.Schema({
  word: {type: String, required: true, unique: true},
  guesses: [{
    movie: {
      type: ObjectId,
      ref: 'Movie'
    },
    count: {type: Number},
  }]
})







const Movie = mongoose.model('Movie', movieTitleSchema);
const Clue = mongoose.model('Clue', clueSchema);

module.exports = {Movie, Clue};