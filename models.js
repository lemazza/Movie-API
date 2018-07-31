'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const ObjectId = mongoose.Schema.Types.ObjectId;

/**
  * Movies
  */

const movieTitleSchema = mongoose.Schema({
  title: {type: String, required: true},
  year: {type: Number},
  guesses: [{
    guessWord: {type: String, required: true},
    count: {type: Number}
  }],
})

userSchema.methods.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    year: this.year,
    guesses: this.guesses,
  }
}