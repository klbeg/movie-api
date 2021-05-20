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
//  Used to create new users after checking that
//  said user doesn't already exist
//  √ working
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
//  √ working
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
//  √ working
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

//  update username
//  √ working
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
    },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

//  Delete a user by username
//  √ working
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//  brings up my top 10 movies as a json file
//  needs update to use mongoose models
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

//  Add a movie to user's list of favorites
app.post('/users/:Username/Movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.MovieID },
    {
      $push: { FavoriteMovies: req.params.MovieID },
    },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    }
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
