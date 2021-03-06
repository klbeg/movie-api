//  imported modules
const express = require('express'),
  morgan = require('morgan'),
  mongoose = require('mongoose'),
  Models = require('./models.js'),
  bodyParser = require('body-parser'),
  passport = require('passport'),
  cors = require('cors');

const app = express();

const { check, validationResult } = require('express-validator');
const path = require('path/posix');
require('./passport');

app.use(bodyParser.json());
app.use(
  cors({
    origin: '*',
  })
);

let auth = require('./auth')(app);

class Movie {
  constructor() {
    (this.Title = title),
      (this.Description = description),
      (this.Genre = {
        Name: genreName,
        Description: description,
      }),
      (this.Director = {
        Name: directorName,
        Bio: bio,
        Birth: birth,
        Death: death,
      }),
      (this.ImagePath = imgPath),
      (this.Featured = featured);
  }
}

class User {
  constructor() {
    (this.Name = nameActual),
      (this.Username = username),
      (this.Password = password),
      (this.Email = email),
      (this.birthdate = birthdate);
  }
}

//  imports mongoose models to assigned variables
/**
 * array of movie objects
 * @type {Movie[]}
 */
const Movies = Models.Movie;
/**
 * array of user objects
 * @type {User[]}
 */
const Users = Models.User;

//  connects app to database  via mongoose using
//  environment variable for security
mongoose.connect(
  //process.env.CONNECTION_URI,
  'mongodb+srv://dataAdmin:pass123@kb-cluster.brimy.mongodb.net/myFlixDb?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
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

//  add movie to list of movies
// @ts-check
/**
 * Add a movie to list of movies.
 * @method POST
 * @param {Movie} - movie to add to list of movies
 * @returns {Movie} - returns movie object
 */

app.post(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  check('Title', 'Title contains non alphanumeric characters - not allowed')
    .matches(/^[a-z0-9 ]+$/i)
    .not()
    .isEmpty(),
  check(
    'Description',
    'Description contains non alphanumeric characters - not allowed'
  )
    .matches(/^[a-z0-9 ]+$/i)
    .not()
    .isEmpty(),
  check(
    'Genre.Name',
    'Genre Name contains non alphanumeric characters - not allowed.'
  )
    .matches(/^[a-z0-9 ]+$/i)
    .not()
    .isEmpty(),
  check(
    'Genre.Description',
    'Genre Description contains non alphanumeric characters - not allowed.'
  ).matches(/^[a-z0-9 ]+$/i),
  check(
    'Director.Name',
    'Director Name contains non alphanumeric characters - not allowed.'
  )
    .matches(/^[a-z0-9 ]+$/i)
    .not()
    .isEmpty(),
  check(
    'Director.Bio',
    'Director Bio contains non alphanumeric characters - not allowed.'
  ).matches(/^[a-z0-9 ]+$/i),
  check(
    'Director.Birth',
    'Director Birth contains non numeric characters - not allowed.'
  ).isDate(),
  check(
    'Director.Death',
    'Director Death contains non numeric characters - not allowed.'
  ).isDate(),
  check(
    'ImagePath',
    'ImagePath is not a valid URL.  Please check your link and try again.'
  ).isURL(),
  check('Featured', 'Featured can only be true or false.').isBoolean(),

  (req, res, next) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
  (req, res) => {
    Movies.findOne({ Title: req.body.Title }).then((movie) => {
      if (movie) {
        return res.status(400).send(req.body.Title + ' already exists.');
      } else {
        Movies.create({
          Title: req.body.Title.toLowerCase(),
          Description: req.body.Description.toLowerCase(),
          Genre: {
            Name: req.body.Genre['Name'].toLowerCase(),
            Description: req.body.Genre['Description'].toLowerCase(),
          },
          Director: {
            Name: req.body.Director['Name'].toLowerCase(),
            Bio: req.body.Director['Bio'].toLowerCase(),
            Birth: req.body.Director['Birth'],
            Death: req.body.Director['Death'],
          },
          ImagePath: req.body.ImagePath,
          Featured: req.body.Featured,
        })
          .then((movie) => {
            res.status(200).json(movie);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          });
      }
    });
  }
);

/**
 * Get's user by username
 * @method GET
 * @param {string} username - username to find in db
 * @returns {User} - returns user object if found, else "User not found"
 */
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
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

//  only used for admin purposes
/**
 * Gets a list of all users
 * @method GET
 * @returns {User[]}
 */
app.get('/users', (req, res) => {
  Users.find().then((users) => {
    res.status(200).json(users);
  });
});

/**
 * Create a new user. If user exists, throws error
 * @method POST
 * @param {User}
 * @returns {User}
 */

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
    //  check('Password', 'Password is required').isAlphanumeric().not().isEmpty(),
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
            Name: req.body.Name.toLowerCase(),
            Username: req.body.Username.toLowerCase(),
            Password: hashedPassword,
            Email: req.body.Email.toLowerCase(),
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

/**
 * Update and change user info.  All fields optional
 * @method PUT
 * @param {object} - only contains fields user wishes to change
 * @returns {User} - updated user info
 */
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
    check('Email', 'Email does not appear to be valid').optional().isEmail(),
    check('Birthdate', 'Birthdate is not a date.').optional().isDate(),
  ],
  (req, res, next) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    Users.findOneAndUpdate(
      //  updates only fields entered into body.
      //  fields not present remain unchanged
      { Username: req.params.Username },
      { $set: req.body },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        }
        // if (!updatedUser) {
        //   res.status(500).send('User could not be updated.');
        else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * Update user password
 * @method PUT
 * @param {string} Username - find user by username
 * @param {string} Password - user password to be hashed and saved
 * @returns {User} - returns updated user info
 */
app.put(
  '/users/:Username/changePass',
  //  Verifies authentication token
  passport.authenticate('jwt', { session: false }),

  // validates any inputed fields while allowing unwanted fields to be left blank
  [
    check('Password', 'Password is required')
      .optional()
      .isAlphanumeric()
      .not()
      .isEmpty(),
  ],
  (req, res, next) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    //  password needs to be hashed before it's saved to DB
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate(
      //  updates only fields entered into body.
      //  fields not present remain unchanged
      { Username: req.params.Username },
      { Password: hashedPassword },
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

/**
 * Deletes profile by username
 * @method DELETE
 * @param {string} username - username to search for
 * @returns {string} - "Username" was deleted.
 */
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

/**
 * Add a movie to user's favorites
 * @method PUT
 * @param {string} username - username to add favorite to
 * @param {string} movieID - movieID to add
 * @returns {Movie[]} - array of favorite movie objects
 */
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
          Users.find({
            Username: req.params.Username,
          }).then((user) => {
            const userFavs = user[0].FavoriteMovies;
            let favMoviesObjArr = [];
            Movies.find()
              .then((movies) => {
                userFavs.map((favID) => {
                  movies.map((movie) => {
                    if (movie._id.toString() == favID.toString()) {
                      favMoviesObjArr.push(movie);
                    }
                  });
                });
              })
              .then(() => {
                res.status(200).json(favMoviesObjArr);
              });
          });
        }
      }
    );
  }
);

/**
 * Delete's a movie from user's favorites
 * @method DELETE
 * @param {string} username - user to delete favorite
 * @param {string} movieID - movie to be deleted
 * @return {Movie[]} - returns array of user's favorite movies
 */
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
          Users.find({
            Username: req.params.Username,
          }).then((user) => {
            const userFavs = user[0].FavoriteMovies;
            let favMoviesObjArr = [];
            Movies.find()
              .then((movies) => {
                userFavs.map((favID) => {
                  movies.map((movie) => {
                    if (movie._id.toString() == favID.toString()) {
                      favMoviesObjArr.push(movie);
                    }
                  });
                });
              })
              .then(() => {
                res.status(200).json(favMoviesObjArr);
              });
          });
        }
      }
    );
  }
);

/**
 * Get list of all movies
 * @method GET
 * @returns {Movie[]} - returns array of all movies
 */
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
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * Get a movie by title
 * @method GET
 * @param {string} title - title of movie to return
 * @return {Movie} - returns movie object
 */
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

/**
 * Get genre info by genre name
 * @method GET
 * @param {string} name - name of genre
 * @returns {object} - returns genre name and description
 */
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

/**
 * Get a directors info by director name
 * @method GET
 * @param {string} name - name of director to find
 * @returns {object} - returns director name, birth, death, and bio
 */
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
