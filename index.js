//  imported modules
const express = require('express'),
  morgan = require('morgan'),
  mongoose = require('mongoose'),
  Models = require('./models.js'),
  bodyParser = require('body-parser'),
  passport = require('passport'),
  cors = require('cors');

const { check, validationResult } = require('express-validator');
require('./passport');

const app = express();
app.use(bodyParser.json());
let auth = require('./auth')(app);

// controls which sites can make requests
let allowedOrigins = ['http://locahost:8080', 'http://testsite.com'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOfI(origin) === -1) {
        let message =
          "The CORS policy for this application doesn't allow access from the origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

//  imports mongoose models to assigned variables
const Movies = Models.Movie;
const Users = Models.User;

//  connects app to database  via mongoose using
//  environment variable for security
mongoose.connect(
  process.env.CONNECTION_URI,
  //'mongodb+srv://dataAdmin:allTheThings@kb-cluster.brimy.mongodb.net/myFlixDb?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

//  middleware
//  throws all requests to terminal
app.use(morgan('common'));
//  searches public folder if request
//  does not reflect an existing page
app.use('/', express.static('public'));
//  throws errors to terminal
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//  Endpoints

//  Default welcome page
app.get('/', (req, res) => {
  res.status(200).send('Welcome to kb-movie-api!');
});

//  get users by username
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username.toLowerCase() })
    .then((user) => {
      if (!user) {
        res.status(400).send('User not found');
      } else {
        res.status(200).json(user);
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//  Used to create new users after checking that
//  said user doesn't already exist
//  √ working
app.post(
  //  validates each field to prevent cross scripting
  '/users',
  [
    check(
      'Name',
      'Name field contains non alphanumeric characters - not allowed.'
    )
      .matches(/^[a-z0-9 ]+$/i)
      .not()
      .isEmpty(),
    check('Username', 'Username is required').isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required').isAlphanumeric().not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
    check('Birthdate', 'Birthdate is not a date.').isDate(),
  ],
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    //  Hashes newly created password and saves the hashed string as password
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users.create({
            Name: req.body.Name,
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthdate: req.body.Birthdate,
          })
            //  returns new user object
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
  }
);

//  update user info
//  √ working, validation √
app.put(
  '/users/:Username',
  //  Verifies authentication token
  passport.authenticate('jwt', { session: false }),
  // validates any inputed fields while allowing unwanted fields to be left blank
  [
    check(
      'Name',
      'Name field contains non alphanumeric characters - not allowed.'
    )
      .optional()
      .matches(/^[a-z0-9 ]+$/i)
      .not()
      .isEmpty(),
    check('Username', 'Username is required').optional().isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed.'
    )
      .optional()
      .isAlphanumeric(),
    check('Password', 'Password is required')
      .optional()
      .isAlphanumeric()
      .not()
      .isEmpty(),
    check('Email', 'Email does not appear to be valid').optional().isEmail(),
    check('Birthdate', 'Birthdate is not a date.').optional().isDate(),
  ],
  (req, res, next) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
  (req, res) => {
    Users.findOneAndUpdate(
      //  updates only fields entered into body.
      //  fields not present remain unchanged
      { Username: req.params.Username },
      req.body,
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        }
        if (!updatedUser) {
          res.status(500).send('User could not be updated.');
        }
        res.json(updatedUser);
      }
    );
  }
);

//  Delete a user by username
//  If a username is found, returns confirmation
//  √ working, validation  √
app.delete(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
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
  }
);

//  Add a movie to user's list of favorites by movie's objectID
//  upon success, returns confirmation
//  √ working, validation √
app.put(
  '/users/:Username/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
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
  }
);

//  removes movie from user's favorites list
//  upon success, returns confirmation
//  √ working, validation √
app.delete(
  '/users/:Username/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
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
  }
);

//  gets a list of all movies to be returned as json
//  √ working, validation √
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + errr);
      });
  }
);

//  gets a movie by title and returns a json
//  √ working, validation √
app.get(
  '/movies/:Title',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

//  get's a genre by name and returns a json
//  √ working, validation √
app.get(
  '/genres/:Name',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
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
  }
);

//  get's director by name and returns a json
//  √ working, validation √
app.get(
  '/directors/:Name',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
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
  }
);

//  listen for requests
//  setting up server on port 8080 if PORT is not defined
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
