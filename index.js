const express = require('express');
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
];

// GET requests
app.get('/movies', (req, res) => {
  res.json(myFavMovies);
});

//  listen for requests
app.listen(8080, () => {
  console.log('movies-api is currently listening to port 8080');
});
