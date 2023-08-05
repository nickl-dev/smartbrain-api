// Get access to process.env
require('dotenv').config();

const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const knex = require('knex');
const PORT = process.env.PORT || 3000;

// Separated functions for API routes
const register = require('./controllers/register');
const signIn = require('./controllers/signIn');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

// Connecting postgres database
const database = knex({
  client: 'pg',
  connection: {
    host : process.env.DATABASE_HOST,
    user : process.env.DATABASE_USER,
    password : process.env.DATABASE_PASSWORD,
    database : process.env.DATABASE_NAME
  }
});

// Express setup
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Server message
app.listen(PORT, () => {
  console.log({
    PORT,
    MESSAGE: 'SmartBrain API is running',
    date: new Date()
  })
})

// Routes
app.get('/', (request, response) => response.json(database.users));
app.get('/profile/:id', (request, response) => profile.handleGetProfileById(request, response, database));  
app.post('/signin', (request, response) => signIn.handleSignIn(request, response, database, bcrypt));
app.post('/register', (request, response) => register.handleRegister(request, response, database, bcrypt ));
app.post('/imageurl', (request, response) => image.handleClarifaiApiCall(request, response));
app.put('/image', (request, response) => image.handleImage(request, response, database));