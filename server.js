const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');

const database = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'test',
    database : 'smartbrain'
  }
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.listen(PORT, () => {
  console.log({
    PORT,
    MESSAGE: 'SmartBrain API is running',
    date: new Date()
  })
})

/*
  ROUTES:
  / -> GET -> return 'API IS WORKING'
  /signin -> POST ->  return user
  /register -> POST -> return user
  /profile/:userID -> GET -> return user
  /image -> PUT -> return user
*/

const databaseArray = {
  users: [
    {
      id: '0',
      name: 'John',
      email: 'john@gmail.com',
      password: 'cookies',
      entries: 0,
      joined: new Date()
    },
    {
      id: '1',
      name: 'Sally',
      email: 'sally@gmail.com',
      password: 'cakes',
      entries: 0,
      joined: new Date()
    }
  ]
}

app.get('/', (request, response) => {
  response.json(databaseArray.users)
})

app.post('/signin', (request, response) => {
  const { email, password } = request.body;
  const user = database.users.find((user) => user.email === email && user.password === password);

  if (user) response.json(user);
  else response.status(404).json('User not found');
})


app.post('/register', (request, response) => {
  console.log(request.body)
  const { name, email, password } = request.body;

  const newUser = {
    name,
    email,
    joined: new Date()
  }

  database('users')
    .returning('*')
    .insert(newUser)
    .then(user => response.json(user[0]))
    .catch(() => response.status(400).json('Unable to register user'));
})

app.get('/profile/:id', (request, response) => {
  const { id } = request.params;

  database('users')
    .select('*')
    .where({ id })
    .then((users) => { 
      if (users.length) response.json(users[0])
      else response.status(400).json('User not found') 
    })
    .catch(() => response.status(400).json('Error getting user'))
})

app.put('/image', (request, response) => {
  const { id } = request.body;

  const user = database.users.find((user) => user.id === id);

  if (user) {
    user.entries++;
    response.json(user.entries);
  } else {
    response.status(404).json('User not found');
  }
})


