const express = require('express'),
  morgan = require('morgan'),
  mongoose = require('mongoose'),
  Models = require('./models.js'),
  bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
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
//  Used to create new users after checking that
//  said user doesn't already exist
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        })
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.sendStatus(500).send('Error: ' + error);
    });
});

//  Get all users
app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//  Get a user by username
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/users/deregister/:username', (req, res) => {
  res
    .status(201)
    .send('This is where users will be able to deregister their accounts');
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
