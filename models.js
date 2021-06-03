const mongoose = require('mongoose'),
  bcrypt = require('bcrypt');

//  defines model of movies to match pre-existing data in mongodb
let movieSchema = mongoose.Schema({
  Title: { type: String, required: true, lowercase: true },
  Description: { type: String, required: true },
  Genre: {
    Name: { type: String, lowercase: true },
    Description: { type: String, lowercase: true },
  },
  Director: {
    Name: { type: String, lowercase: true },
    Bio: { type: String, lowercase: true },
    Birth: String,
    Death: String,
  },
  Actors: [{ type: String, lowercase: true }],
  ImagePath: String,
  Featured: Boolean,
});

//  defines the model for users to match pre-existing data in mongodb
let userSchema = mongoose.Schema({
  Name: { type: String, required: false, lowercase: true },
  Username: { type: String, required: true, lowercase: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true, lowercase: true },
  Birthdate: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
});

//  stores password in it's hashed form to user object
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

//  upon login, checks entered password against it's hashed version
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
