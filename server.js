const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

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

const database = {
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
  response.json(database.users)
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
    id: '1',
    name,
    email,
    password,
    entries: 0,
    joined: new Date()
  }

  if (name && email && password) {
    database.users.push(newUser);
    response.json(newUser);
  } else {
    response.json('Invalid credentials');
  }
})

app.get('/profile/:id', (request, response) => {
  const { id } = request.params;
  const user = database.users.find((user) => user.id === id);

  if (user) response.json(user);
  else response.status(404).json('User not found')
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


