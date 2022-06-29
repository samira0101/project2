// Server for My Thoughts

// Dependencies
// path module
const path = require('path');
// dotenv file for sensitive configuration information
require('dotenv').config();
// Express.js server
const express = require('express');
// In the controllers folder, all routes are defined.
const routes = require('./controllers/');
// Sequelize connection to the database
const sequelize = require('./config/connection');
// Handlebars template engine for front-end
const exphbs = require('express-handlebars')
// Express session to handle session cookies
const session = require('express-session')
// To keep the user logged in, utilise the Sequelize store to save the session.
const SequelizeStore = require('connect-session-sequelize')(session.Store);
// Handlebars helpers
const helpers = require('./utils/helpers');

// Initialize handlebars for the html templates
const hbs = exphbs.create({ helpers });

// Initialize sessions
const sess = {
    secret: 'Super secret secret',
    cookie: { maxAge: 7200000 },
    resave: false,
    saveUninitialized: true,
    store: new SequelizeStore({
      db: sequelize
    })
  };

// Initialize the server
const app = express();
// Define the port for the server
const PORT = process.env.PORT || 3001;

// Set a path to the public directory for static files on the server.
app.use(express.static(path.join(__dirname, 'public')));

// Set handlebars as the template engine for the server
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Have Express parse JSON and string data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Tell the app to handle sessions with Express Session.
app.use(session(sess));

// Give the server the path to the routes
app.use(routes);

// Connect to the database and then to the server
// force: true to reset the database and clear all values, updating any new relationships
// force: false to maintain data - aka normal operation
sequelize.sync({ force: false }).then(() => {
    app.listen(PORT, () => console.log('Now listening'));
  });