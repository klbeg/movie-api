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

//
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

const Movies = Models.Movie;
const Users = Models.User;

//  connects app to database  via mongoose using
//  environment variable for security
mongoose.connect(
  'process.env.CONNECTION_URI',
  //'mongodb+srv://dataAdmin:allTheThings@kb-cluster.brimy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
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

//  Used to create new users after checking that
//  said user doesn't already exist
//  √ working
app.post(
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
  passport.authenticate('jwt', { session: false }),
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
  }
);

//  Delete a user by username
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

//  Add a movie to user's list of favorites
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

//  gets a list of all movies
//  √ working, validation √
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + errr);
      });
  }
);

//  get movie by title
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

//  get genre by name
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

//  get director by name
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
//  setting up server on port 8080
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
