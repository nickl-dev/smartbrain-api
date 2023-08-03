const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const knex = require('knex');
const PORT = process.env.PORT || 3000;

const app = express();

const database = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'test',
    database : 'smartbrain'
  }
});

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

app.get('/', (request, response) => {
  database.select('*').from('users')
  .then((users) => response.json(users))
  .catch(() => response.status(400).json('Unable to get users'))
})

app.post('/signin', (request, response) => {
  const { email, password } = request.body;

  database.select('hash', 'email')
    .from('login')
    .where('email', '=', email)
    .then((data) => {
      // Check to make sure that the password matches the hash
      const isValid = bcrypt.compareSync(password, data[0].hash);

      if (isValid) {
        return database.select('*')
          .from('users')
          .where('email', '=', email)
          .then((user) => response.json(user[0]))
          .catch(() => response.status(400).json('Unable to get user'))
      } else {
        response.status(400).json('Wrong credentials');
      }
    })
    .catch(() => response.status(400).json('Wrong credentials'));
})


app.post('/register', (request, response) => {
  const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  const { name, email, password } = request.body;
  
  // Check to make sure that the email address is valid
  if (!emailRegexp.test(email)) return response.status(400).json('Invalid email address');

  bcrypt.genSalt(10, (error, salt) => {
    bcrypt.hash(password, salt, (error, hash) => {

        // Store hash in the login database
      database.transaction((trx) => {
        trx.insert({ hash, email })
          .into('login')
          .returning('email')
          .then((loginEmail) => {
            return trx('users')
              .returning('*')
              .insert({
                name,
                email: loginEmail[0].email,
                joined: new Date ()
              })
              .then((user) => response.json(user[0]))
          })
          .then(trx.commit)
          .catch(trx.rollback)
      })
      .catch(() => response.status(400).json('Unable to register'))
    });
  });
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

  database('users')
    .where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then((entries) => response.json(entries[0].entries))
    .catch(() => response.status(400).json('Unable to get entries'))
})


