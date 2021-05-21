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

//  Endpoints

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
          Name: req.body.Name,
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthdate: req.body.Birthdate,
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

//  update user info
//  √ working
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    req.body,
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

//  Add a movie to user's list of favorites
//  √ working
app.put('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $push: { FavoriteMovies: req.params.MovieID },
    },
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res
          .status(200)
          .send(
            'MovieID ' + req.params.MovieID + ' has been added to favorites.'
          );
      }
    }
  );
});

//  removes movie from user's favorites list
//  √ working
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    { $pull: { FavoriteMovies: req.params.MovieID } },
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res
          .status(200)
          .send(
            'MovieID ' +
              req.params.MovieID +
              ' has been removed from favorites.'
          );
      }
    }
  );
});

//  gets a list of all movies
//  √ working
app.get('/movies', (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + errr);
    });
});

//  get movie by title
//  √ working
app.get('/movies/:Title', (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//  get genre by name
//  √ working...  would like to only return genre info,
//  not whole movie record
app.get('/genres/:Name', (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.Name })
    .then((genre) => {
      res.json(genre.Genre);
    })
    .catch((err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      }
    });
});

//  get director by name
//  √ working...  would like to return only director info,
//  not whole movie record
app.get('/directors/:Name', (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Name })
    .then((director) => {
      res.json(director.Director);
    })
    .catch((err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      }
    });
});

//  listen for requests
//  setting up server on port 8080
app.listen(8080, () => {
  console.log('movies-api is currently listening to port 8080');
});

/*
//  Removed because users shouldn't have access 
//  to this function

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

//  Removed because users shouldn't have access 
//  to this function

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
*/
