const mongoose = require('mongoose'),
  bcrypt = require('bcrypt');

//  defines model of movies to match pre-existing data in mongodb
let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: { type: String },
    Description: { type: String },
  },
  Director: {
    Name: { type: String },
    Bio: { type: String },
    Birth: String,
    Death: String,
  },
  ImagePath: String,
  Featured: Boolean,
});

//  defines the model for users to match pre-existing data in mongodb
let userSchema = mongoose.Schema({
  Name: { type: String, required: false },
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
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
