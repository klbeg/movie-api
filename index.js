const express = require('express'),
  morgan = require('morgan'),
  mongoose = require('mongoose'),
  Models = require('./models.js');

const app = express();
const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myFlixDb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//  middleware
//  throws all requests to terminal
app.use(morgan('common'));
//  searches public folder if request
//  does not reflect an existing page
app.use('/', express.static('public'));
//  throws errors to terminal...  not working.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// GET requests
//  brings up my top 10 movies as a json file
app.get('/movies', (req, res) => {
  res.json(FavoriteMovies);
});
app.get('/movies/info/:name', (req, res) => {
  res
    .status(201)
    .send(
      "This will return the searched movie's description, genre, director, wether it's featured and an image URL"
    );
});
app.get('/movies/genres/:name', (req, res) => {
  res.status(201).send('This will return a description of the searched genre');
});
app.get('/movies/directors/:name', (req, res) => {
  res
    .status(201)
    .send(
      "This will return the searched director's biography as well as birth and death years"
    );
});
//  This will use PUT method
app.get('/users/register', (req, res) => {
  res.status(201).send('This is where new users will be able to register');
});
app.get('/users/update/:new-name', (req, res) => {
  res
    .status(201)
    .send('This is where users will be able to update their usernames');
});
app.get('/movies/add', (req, res) => {
  res
    .status(201)
    .send(
      'This is where users will be able to add new movies to their favorites list'
    );
});
app.get('/movies/remove/:title', (req, res) => {
  res
    .status(201)
    .send(
      'This is where users will be able to remove movies from their favorites'
    );
});
app.get('/users/deregister/:username', (req, res) => {
  res
    .status(201)
    .send('This is where users will be able to deregister their accounts');
});

//  listen for requests
//  setting up server on port 8080
app.listen(8080, () => {
  console.log('movies-api is currently listening to port 8080');
});
/*
  let FavoriteMovies = [
    {
      title: `Grandma's Boy`,
      director: 'Nicholaus Goosen',
    },
    {
      title: 'Fight Club',
      director: 'David Fincher',
    },
    {
      title: 'The Hateful Eight',
      director: 'Quentin Tarantino',
    },
    {
      title: 'Django',
      director: 'Quentin Tarantino',
    },
    {
      title: 'Snatch',
      director: 'Guy Ritchie',
    },
    {
      title: 'American History X',
      director: 'Tony Kaye',
    },
    {
      title: 'Zoolander',
      director: 'Ben Stiller',
    },
    {
      title: 'Anchorman',
      director: 'Adam McKay',
    },
    {
      title: 'Boondock Saints',
      director: 'Troy Duffy',
    },
    {
      title: 'Step Brothers',
      director: 'Adam McKay',
    },
  ];
  */
