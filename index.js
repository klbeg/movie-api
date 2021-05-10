const express = require('express'),
  morgan = require('morgan');
const app = express();

let myFavMovies = [
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
  res.json(myFavMovies);
});

//  listen for requests
//  setting up server on port 8080
app.listen(8080, () => {
  console.log('movies-api is currently listening to port 8080');
});
