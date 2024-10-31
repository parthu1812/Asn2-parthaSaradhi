const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const { engine } = require('express-handlebars');
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.engine('.hbs', engine({
  extname: '.hbs',
  helpers: {
    hasMetascore: (metascore) => metascore && metascore.trim() !== '',
    highlightRow: (metascore) => !metascore || metascore.trim() === '' ? 'highlight' : ''
  },
  partialsDir: path.join(__dirname, 'views/partials') // Register partials directory
}));
app.set('view engine', 'hbs');

let movieData;

// Load movieData.json
fs.readFile(path.join(__dirname, 'movie-dataset-a2.json'), 'utf8', (err, data) => {
  if (err) {
    console.error('Error loading JSON file:', err);
    return;
  }
  movieData = JSON.parse(data);
  console.log('JSON data is loaded and ready!');
});

// Home route
app.get('/', (req, res) => {
  res.render('index', { title: 'Assignment 2 - Home', name: 'Partha Saradhi', studentId: 'N01617907' });
});

// Data route to display JSON load status
app.get('/data', (req, res) => {
  const status = movieData ? 'JSON data is loaded and ready!' : 'Error loading JSON data';
  res.render('data', { title: 'Data Status', status });
});

// Route to display all movie data in an HTML table
app.get('/allData', (req, res) => {
  res.render('allData', { title: 'All Movies with Metascore', movies: movieData });
});

// Dynamic route to display a movie by index
app.get('/data/movie/:index', (req, res) => {
  const index = parseInt(req.params.index);
  if (movieData && index >= 0 && index < movieData.length) {
    res.render('movie', { title: `Movie - ${movieData[index].Title}`, movie: movieData[index] });
  } else {
    res.status(404).render('error', { title: 'Error', message: 'Invalid index or movie not found' });
  }
});

// Route to display the search form for movie ID
app.get('/data/search/id', (req, res) => {
  res.render('searchId', { title: 'Search by Movie ID' });
});

// Route to handle form submission and search by movie ID
app.get('/data/search/id/result', (req, res) => {
  const movieId = req.query.movie_id;
  const movie = movieData.find(m => m.Movie_ID == movieId);
  if (movie) {
    res.render('movie', { title: `Movie Found: ${movie.Title}`, movie });
  } else {
    res.render('error', { title: 'Movie Not Found', message: `No movie found for ID ${movieId}` });
  }
});

// Route to display the search form for movie title
app.get('/data/search/title', (req, res) => {
  res.render('searchTitle', { title: 'Search by Movie Title' });
});

// Route to handle form submission and search by movie title
app.get('/data/search/title/result', (req, res) => {
  const titleQuery = req.query.title.toLowerCase();
  const results = movieData.filter(movie => movie.Title.toLowerCase().includes(titleQuery));
  if (results.length > 0) {
    res.render('searchResults', { title: 'Search Results', results });
  } else {
    res.render('error', { title: 'No Results', message: `No movies found with the title containing "${titleQuery}"` });
  }
});

// 404 route
app.use((req, res) => {
  res.status(404).render('error', { title: '404', message: 'Page not found' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
